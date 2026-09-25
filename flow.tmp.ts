import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { NestFactory } from '@nestjs/core';
import { getQueueToken } from '@nestjs/bullmq';
import { AppModule } from './src/app.module';
import { OrdersService } from './src/routes/orders/orders.service';
import { OrdersRepo } from './src/routes/orders/orders.repo';
import { ORDER_EXPIRY_QUEUE, expireJobId } from './src/routes/orders/order-expiry.constants';

process.env.ORDER_PAYMENT_TIMEOUT_MINUTES = '0.5'; // 30 giây (Neon chậm nên không rút ngắn hơn)
const prisma = new PrismaClient();
let failed = 0;
const ok = (name: string, cond: boolean, extra?: unknown) => { if (!cond) failed++; console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`, cond && !extra ? '' : (extra ?? '')); };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const msg = (e: any) => String(e?.response?.message ?? e?.message);
const waitFor = async (fn: () => Promise<boolean>, ms = 70000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await sleep(500); } return false; };

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const svc = app.get(OrdersService);
  const repo = app.get(OrdersRepo);
  const queue: any = app.get(getQueueToken(ORDER_EXPIRY_QUEUE));
  const userIds: string[] = [], couponIds: string[] = [], orderIds: string[] = [];
  const tag = Date.now();
  try {
    const course = await prisma.course.findFirst({ where: { status: 'PUBLISHED', deletedAt: null, price: { gt: 0 } }, select: { id: true, price: true, salePrice: true } });
    const price = course!.salePrice || course!.price;
    const V = Math.max(1, Math.floor(price / 4)); // giá trị giảm cố định dùng trong test
    console.log('course price used:', price, 'discount value:', V);
    const mkUser = async (n: string) => { const u = await prisma.user.create({ data: { email: `flow-${tag}-${n}@example.invalid`, password: 'x', name: `Flow ${n}`, phoneNumber: '0' } }); userIds.push(u.id); return u.id; };
    const mkCart = async (userId: string) => { await prisma.cart.deleteMany({ where: { userId } }); await prisma.cart.create({ data: { userId, cartItems: { create: [{ courseId: course!.id }] } } }); };
    const mkCoupon = async (code: string, data: any) => { const c = await prisma.coupon.create({ data: { code: `${code}${tag}`, type: 'FIXED', value: V, perUserLimit: 1, courseIds: [], isActive: true, ...data } }); couponIds.push(c.id); return c; };
    const order = async (userId: string, code?: string) => { await mkCart(userId); const o = await svc.createOrder(code ? { couponCode: code } : ({} as any), userId); orderIds.push(o.id); return o; };
    const reds = (couponId: string) => prisma.couponRedemption.count({ where: { couponId } });
    const status = async (id: string) => (await prisma.order.findUnique({ where: { id } }))!.status;
    const reject = async (name: string, fn: () => Promise<unknown>, contains: string) => { try { await fn(); ok(name, false, 'không ném lỗi'); } catch (e) { ok(name, msg(e).includes(contains), msg(e)); } };

    const [u1, u2, u3, u4, u5, u6] = await Promise.all(['1', '2', '3', '4', '5', '6'].map(mkUser));

    // ===== 1. Chiếm lượt khi tạo đơn, giới hạn theo người và tổng =====
    const A = await mkCoupon('FLOWA', { usageLimit: 3, perUserLimit: 2 });
    const o1 = await order(u1, A.code);
    ok('order created with discount, expiresAt set', o1.totalAmount === price - V && o1.discountAmount === V && !!o1.expiresAt && o1.status === 'PENDING', { total: o1.totalAmount, price });
    ok('redemption row created (slot 1)', (await prisma.couponRedemption.findFirst({ where: { orderId: o1.id } }))?.slot === 1);
    const job = await queue.getJob(expireJobId(o1.id));
    ok('delayed BullMQ job scheduled for the order', !!job && (await job.getState()) === 'delayed', job && (await job.getState()));
    const o2 = await order(u1, A.code);
    ok('same user second use -> slot 2', (await prisma.couponRedemption.findFirst({ where: { orderId: o2.id } }))?.slot === 2);
    await reject('same user third use rejected (perUserLimit=2)', () => order(u1, A.code), 'hết lượt của mã');
    const o3 = await order(u2, A.code);
    ok('another user can use shared code (total 3/3)', (await reds(A.id)) === 3);
    await reject('total usageLimit reached -> rejected', () => order(u3, A.code), 'hết lượt sử dụng');

    // ===== 2. Hết hạn thanh toán: worker hủy đơn và TRẢ LƯỢT =====
    const expired = await waitFor(async () => (await status(o1.id)) === 'FAILED' && (await status(o2.id)) === 'FAILED' && (await status(o3.id)) === 'FAILED');
    ok('BullMQ worker cancelled all 3 unpaid orders after the 30s timeout', expired);
    ok('redemptions deleted (usage returned)', (await reds(A.id)) === 0);
    const o4 = await order(u3, A.code);
    ok('after release, the previously blocked user can use the code', o4.status === 'PENDING' && (await reds(A.id)) === 1);
    ok('job cleaned from queue after completion', !(await queue.getJob(expireJobId(o1.id))));

    // ===== 3. Đơn đã thanh toán thì giữ lượt, không bị hủy =====
    await waitFor(async () => (await status(o4.id)) === 'FAILED'); // dọn o4 để có chỗ
    const B = await mkCoupon('FLOWB', { usageLimit: 5, perUserLimit: 1 });
    const o5 = await order(u4, B.code);
    const paid = await repo.payOrder(o5.id, u4); // giả lập webhook/luồng kiểm tra chốt PAID
    await svc.cancelExpiryJob(o5.id);
    await sleep(36000);
    ok('paid order stays PAID after expiry time, redemption kept', (await status(o5.id)) === 'PAID' && paid.transitioned && (await reds(B.id)) === 1);
    ok('paid user cannot reuse (perUserLimit=1)', await (async () => { try { await order(u4, B.code); return false; } catch (e) { return msg(e).includes('hết lượt của mã'); } })());

    // ===== 4. Chạy song song: usageLimit không bị vượt =====
    const C = await mkCoupon('FLOWC', { usageLimit: 2, perUserLimit: 1 });
    const racers = [u1, u2, u3, u5, u6];
    await Promise.all(racers.map((u) => mkCart(u)));
    const results = await Promise.allSettled(racers.map((u) => svc.createOrder({ couponCode: C.code } as any, u)));
    results.forEach((r) => r.status === 'fulfilled' && orderIds.push(r.value.id));
    const okCount = results.filter((r) => r.status === 'fulfilled').length;
    ok('5 concurrent orders, usageLimit=2 -> exactly 2 succeed', okCount === 2 && (await reds(C.id)) === 2, { okCount, reds: await reds(C.id), errors: results.filter((r) => r.status === 'rejected').map((r: any) => msg(r.reason)) });

    // ===== 5. Admin đổi FAILED cũng trả lượt (đi qua failOrder) =====
    const ok2 = results.find((r) => r.status === 'fulfilled') as any;
    await svc.updateOrderStatus(ok2.value.id, { status: 'FAILED' } as any);
    ok('admin sets FAILED -> redemption released', (await status(ok2.value.id)) === 'FAILED' && (await reds(C.id)) === 1);

    // ===== 6. Mã giảm 100%: đơn 0đ tự chốt PAID + ghi danh =====
    const D = await mkCoupon('FLOWD', { type: 'PERCENT', value: 100, usageLimit: 1 });
    const o0 = await order(u5, D.code);
    ok('100% coupon -> total 0, auto PAID', o0.totalAmount === 0 && o0.status === 'PAID', { total: o0.totalAmount, status: o0.status });
    ok('free order enrolled the user, no expiry job', (await prisma.enrollment.count({ where: { userId: u5, courseId: course!.id } })) === 1 && !(await queue.getJob(expireJobId(o0.id))));

    // ===== 7. Job quét: đơn quá hạn (kể cả đơn cũ không có expiresAt) =====
    const E = await mkCoupon('FLOWE', { usageLimit: 5, perUserLimit: 3 });
    const mkPending = async (data: any) => { const o = await prisma.order.create({ data: { userId: u6, totalAmount: 1000, status: 'PENDING', couponId: E.id, couponCode: E.code, ...data, orderItems: { create: [{ courseId: course!.id, price: 1000 }] } } }); orderIds.push(o.id); return o; };
    const pastExp = await mkPending({ expiresAt: new Date(Date.now() - 5000) });
    const legacy = await mkPending({ expiresAt: null, createdAt: new Date(Date.now() - 3600_000) });
    const fresh = await mkPending({ expiresAt: new Date(Date.now() + 3600_000) });
    let slot = 1; for (const o of [pastExp, legacy, fresh]) await prisma.couponRedemption.create({ data: { couponId: E.id, userId: u6, orderId: o.id, slot: slot++, discountAmount: 0 } });
    const swept = await svc.expireOverdueOrders();
    ok('sweep cancels overdue + legacy, keeps fresh', swept >= 2 && (await status(pastExp.id)) === 'FAILED' && (await status(legacy.id)) === 'FAILED' && (await status(fresh.id)) === 'PENDING', { swept });
    ok('sweep released their redemptions (only fresh keeps one)', (await reds(E.id)) === 1);

    // ===== 8. Idempotency của hủy =====
    ok('failOrder twice is safe (second returns false)', (await svc.failOrder(fresh.id, 'expired')) === true && (await svc.failOrder(fresh.id, 'expired')) === false && (await reds(E.id)) === 0);
  } catch (e) { failed++; console.error('FATAL', e); }
  finally {
    for (const id of orderIds) await queue.remove(expireJobId(id)).catch(() => {});
    await prisma.auditLog.deleteMany({ where: { targetId: { in: orderIds } } });
    await prisma.couponRedemption.deleteMany({ where: { OR: [{ couponId: { in: couponIds } }, { userId: { in: userIds } }] } });
    await prisma.paymentTransaction.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.enrollment.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.cart.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.coupon.deleteMany({ where: { id: { in: couponIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    console.log('cleanup leftovers:', { users: await prisma.user.count({ where: { id: { in: userIds } } }), orders: await prisma.order.count({ where: { id: { in: orderIds } } }), coupons: await prisma.coupon.count({ where: { id: { in: couponIds } } }) });
    console.log(failed ? `FAILED: ${failed}` : 'ALL PASSED');
    await prisma.$disconnect(); process.exit(0);
  }
})();

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { CouponsService } from "./coupons.service";
import {
  CouponParamsDto,
  CreateCouponBodyDto,
  GetCouponsQueryDto,
  UpdateCouponBodyDto,
  ValidateCouponBodyDto,
} from "./coupons.dto";

@Controller("api")
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  // Client: xem trước giảm giá trên giỏ hàng
  @Post("coupons/validate")
  async validate(@Body() body: ValidateCouponBodyDto, @ActiveUser() user: any) {
    return this.service.validateForCart((body as any).code, user.userId);
  }

  // Admin
  @Get("admin/coupons")
  async getCoupons(@Query() query: GetCouponsQueryDto) {
    return this.service.getCoupons(query as any);
  }

  @Audit("coupon.create", "Coupon")
  @Post("admin/coupons")
  async createCoupon(@Body() body: CreateCouponBodyDto, @ActiveUser() user: any) {
    return this.service.createCoupon(body as any, user.userId);
  }

  @Audit("coupon.update", "Coupon")
  @Put("admin/coupons/:id")
  async updateCoupon(@Param() params: CouponParamsDto, @Body() body: UpdateCouponBodyDto) {
    return this.service.updateCoupon((params as any).id, body as any);
  }

  @Audit("coupon.delete", "Coupon")
  @Delete("admin/coupons/:id")
  async deleteCoupon(@Param() params: CouponParamsDto) {
    return this.service.deleteCoupon((params as any).id);
  }
}

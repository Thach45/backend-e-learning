import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { homeApi, type AdminBanner, type AdminTestimonial, type BannerForm, type HomeSettings, type TestimonialForm } from '../../api/home';
import ImageUpload from '../../components/common/ImageUpload';

const input = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none';
const card = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4';
const errMsg = (e: any) => e?.response?.data?.message ?? 'Thao tác thất bại.';
const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);

// ----- Cài đặt chung -----
const SettingsCard = () => {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'home', 'settings'], queryFn: homeApi.settings });
  const [f, setF] = useState<HomeSettings | null>(null);
  useEffect(() => { if (data) setF(data); }, [data]);
  const save = useMutation({
    mutationFn: (b: HomeSettings) => homeApi.saveSettings({ ...b, heroTitle: b.heroTitle?.trim() || null, heroSubtitle: b.heroSubtitle?.trim() || null }),
    onSuccess: () => { toast.success('Đã lưu.'); qc.invalidateQueries({ queryKey: ['admin', 'home', 'settings'] }); qc.invalidateQueries({ queryKey: ['home-config'] }); },
    onError: (e) => toast.error(errMsg(e)),
  });
  if (!f) return <div className={card}><Loader2 className="animate-spin" /></div>;
  const toggle = (k: 'showCategories' | 'showFeatured' | 'showTestimonials' | 'showLatestPosts', label: string) => (
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} /> {label}</label>
  );
  return (
    <section className={card}>
      <h2 className="font-bold text-lg">Tiêu đề và các khối</h2>
      <label className="block space-y-1"><span className="text-xs text-slate-500">Tiêu đề chính (để trống dùng mặc định)</span><input className={input} maxLength={120} value={f.heroTitle ?? ''} onChange={(e) => setF({ ...f, heroTitle: e.target.value })} /></label>
      <label className="block space-y-1"><span className="text-xs text-slate-500">Mô tả ngắn</span><textarea rows={2} className={input} maxLength={300} value={f.heroSubtitle ?? ''} onChange={(e) => setF({ ...f, heroSubtitle: e.target.value })} /></label>
      <div className="grid grid-cols-2 gap-2">
        {toggle('showCategories', 'Danh mục')}{toggle('showFeatured', 'Khoá học nổi bật')}{toggle('showTestimonials', 'Lời chứng thực')}{toggle('showLatestPosts', 'Bài viết mới')}
      </div>
      <button onClick={() => save.mutate(f)} disabled={save.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50"><Save size={15} /> Lưu</button>
    </section>
  );
};

// ----- Banner -----
const emptyBanner: BannerForm = { title: '', subtitle: '', imageUrl: '', linkUrl: '', ctaLabel: '', position: 0, isActive: true, startsAt: null, endsAt: null };
const BannersCard = () => {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'home', 'banners'], queryFn: homeApi.banners });
  const [editing, setEditing] = useState<{ id?: string; form: BannerForm } | null>(null);
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin', 'home', 'banners'] }); qc.invalidateQueries({ queryKey: ['home-config'] }); };
  const save = useMutation({
    mutationFn: () => {
      const f = editing!.form;
      const body = { ...f, subtitle: f.subtitle || null, linkUrl: f.linkUrl || null, ctaLabel: f.ctaLabel || null };
      return editing!.id ? homeApi.updateBanner(editing!.id, body) : homeApi.createBanner(body);
    },
    onSuccess: () => { toast.success('Đã lưu banner.'); setEditing(null); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const del = useMutation({ mutationFn: homeApi.deleteBanner, onSuccess: refresh, onError: (e) => toast.error(errMsg(e)) });
  const edit = (b: AdminBanner) => setEditing({ id: b.id, form: { title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl, linkUrl: b.linkUrl, ctaLabel: b.ctaLabel, position: b.position, isActive: b.isActive, startsAt: b.startsAt, endsAt: b.endsAt } });
  const f = editing?.form;
  const set = (p: Partial<BannerForm>) => setEditing((e) => (e ? { ...e, form: { ...e.form, ...p } } : e));

  return (
    <section className={card}>
      <div className="flex items-center justify-between"><h2 className="font-bold text-lg">Banner</h2><button onClick={() => setEditing({ form: emptyBanner })} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"><Plus size={16} /> Thêm</button></div>
      <ul className="space-y-2">
        {data?.map((b) => (
          <li key={b.id} className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
            <img src={b.imageUrl} alt="" className="w-20 h-12 object-cover rounded-lg bg-slate-100" />
            <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{b.title}</p><p className="text-xs text-slate-400">Thứ tự {b.position}{!b.isActive && ' · đang tắt'}{b.endsAt && ` · đến ${new Date(b.endsAt).toLocaleDateString('vi-VN')}`}</p></div>
            <button onClick={() => edit(b)} aria-label="Sửa" className="text-slate-400 hover:text-indigo-600"><Pencil size={15} /></button>
            <button onClick={() => window.confirm('Xoá banner này?') && del.mutate(b.id)} aria-label="Xoá" className="text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
          </li>
        ))}
        {data?.length === 0 && <li className="text-sm text-slate-400">Chưa có banner. Trang chủ sẽ không hiện khối này.</li>}
      </ul>
      {editing && f && (
        <div className="border border-indigo-200 rounded-xl p-4 space-y-3 bg-indigo-50/40 dark:bg-slate-950">
          <div className="flex justify-between"><p className="font-semibold text-sm">{editing.id ? 'Sửa banner' : 'Banner mới'}</p><button onClick={() => setEditing(null)} aria-label="Đóng"><X size={16} /></button></div>
          <input className={input} placeholder="Tiêu đề" maxLength={120} value={f.title} onChange={(e) => set({ title: e.target.value })} />
          <input className={input} placeholder="Mô tả ngắn (tuỳ chọn)" maxLength={250} value={f.subtitle ?? ''} onChange={(e) => set({ subtitle: e.target.value })} />
          <ImageUpload value={f.imageUrl} onChange={(url) => set({ imageUrl: url })} label="Ảnh banner (khuyên dùng tỉ lệ ngang 3:1)" folder="banners" />
          <div className="grid grid-cols-2 gap-3">
            <input className={input} placeholder="Liên kết (https://... hoặc /courses)" value={f.linkUrl ?? ''} onChange={(e) => set({ linkUrl: e.target.value })} />
            <input className={input} placeholder="Chữ trên nút (vd: Xem ngay)" maxLength={40} value={f.ctaLabel ?? ''} onChange={(e) => set({ ctaLabel: e.target.value })} />
            <label className="space-y-1"><span className="text-xs text-slate-500">Bắt đầu hiện</span><input type="datetime-local" className={input} value={toLocal(f.startsAt ?? null)} onChange={(e) => set({ startsAt: fromLocal(e.target.value) })} /></label>
            <label className="space-y-1"><span className="text-xs text-slate-500">Ngừng hiện</span><input type="datetime-local" className={input} value={toLocal(f.endsAt ?? null)} onChange={(e) => set({ endsAt: fromLocal(e.target.value) })} /></label>
            <label className="space-y-1"><span className="text-xs text-slate-500">Thứ tự (nhỏ hiện trước)</span><input type="number" min={0} className={input} value={f.position ?? 0} onChange={(e) => set({ position: Number(e.target.value) || 0 })} /></label>
            <label className="flex items-center gap-2 text-sm pt-5"><input type="checkbox" checked={f.isActive ?? true} onChange={(e) => set({ isActive: e.target.checked })} /> Đang bật</label>
          </div>
          <button onClick={() => save.mutate()} disabled={save.isPending || !f.title.trim() || !f.imageUrl} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50">Lưu banner</button>
        </div>
      )}
    </section>
  );
};

// ----- Lời chứng thực -----
const emptyT: TestimonialForm = { name: '', role: '', avatarUrl: null, content: '', rating: 5, position: 0, isActive: true };
const TestimonialsCard = () => {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'home', 'testimonials'], queryFn: homeApi.testimonials });
  const [editing, setEditing] = useState<{ id?: string; form: TestimonialForm } | null>(null);
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin', 'home', 'testimonials'] }); qc.invalidateQueries({ queryKey: ['home-config'] }); };
  const save = useMutation({
    mutationFn: () => {
      const f = editing!.form;
      const body = { ...f, role: f.role || null, avatarUrl: f.avatarUrl || null };
      return editing!.id ? homeApi.updateTestimonial(editing!.id, body) : homeApi.createTestimonial(body);
    },
    onSuccess: () => { toast.success('Đã lưu.'); setEditing(null); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const del = useMutation({ mutationFn: homeApi.deleteTestimonial, onSuccess: refresh, onError: (e) => toast.error(errMsg(e)) });
  const edit = (t: AdminTestimonial) => setEditing({ id: t.id, form: { name: t.name, role: t.role, avatarUrl: t.avatarUrl, content: t.content, rating: t.rating, position: t.position, isActive: t.isActive } });
  const f = editing?.form;
  const set = (p: Partial<TestimonialForm>) => setEditing((e) => (e ? { ...e, form: { ...e.form, ...p } } : e));

  return (
    <section className={card}>
      <div className="flex items-center justify-between"><h2 className="font-bold text-lg">Lời chứng thực</h2><button onClick={() => setEditing({ form: emptyT })} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"><Plus size={16} /> Thêm</button></div>
      <p className="text-xs text-slate-500">Chỉ đăng lời nhận xét thật và đã được người nói đồng ý.</p>
      <ul className="space-y-2">
        {data?.map((t) => (
          <li key={t.id} className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{t.name}{t.role && <span className="font-normal text-slate-400"> · {t.role}</span>}{!t.isActive && <span className="text-xs text-amber-600"> · đang tắt</span>}</p><p className="text-xs text-slate-500 truncate">{t.content}</p></div>
            <button onClick={() => edit(t)} aria-label="Sửa" className="text-slate-400 hover:text-indigo-600"><Pencil size={15} /></button>
            <button onClick={() => window.confirm('Xoá lời chứng thực này?') && del.mutate(t.id)} aria-label="Xoá" className="text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
          </li>
        ))}
        {data?.length === 0 && <li className="text-sm text-slate-400">Chưa có lời chứng thực. Trang chủ sẽ không hiện khối này.</li>}
      </ul>
      {editing && f && (
        <div className="border border-indigo-200 rounded-xl p-4 space-y-3 bg-indigo-50/40 dark:bg-slate-950">
          <div className="flex justify-between"><p className="font-semibold text-sm">{editing.id ? 'Sửa' : 'Lời chứng thực mới'}</p><button onClick={() => setEditing(null)} aria-label="Đóng"><X size={16} /></button></div>
          <div className="grid grid-cols-2 gap-3">
            <input className={input} placeholder="Tên" maxLength={80} value={f.name} onChange={(e) => set({ name: e.target.value })} />
            <input className={input} placeholder="Vai trò (vd: Lập trình viên)" maxLength={120} value={f.role ?? ''} onChange={(e) => set({ role: e.target.value })} />
          </div>
          <textarea className={input} rows={3} placeholder="Nội dung (tối đa 600 ký tự)" maxLength={600} value={f.content} onChange={(e) => set({ content: e.target.value })} />
          <ImageUpload value={f.avatarUrl ?? ''} onChange={(url) => set({ avatarUrl: url })} label="Ảnh đại diện (tuỳ chọn)" folder="testimonials" />
          <div className="grid grid-cols-3 gap-3">
            <label className="space-y-1"><span className="text-xs text-slate-500">Số sao</span><select className={input} value={f.rating ?? ''} onChange={(e) => set({ rating: e.target.value ? Number(e.target.value) : null })}><option value="">Không hiện</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} sao</option>)}</select></label>
            <label className="space-y-1"><span className="text-xs text-slate-500">Thứ tự</span><input type="number" min={0} className={input} value={f.position ?? 0} onChange={(e) => set({ position: Number(e.target.value) || 0 })} /></label>
            <label className="flex items-center gap-2 text-sm pt-5"><input type="checkbox" checked={f.isActive ?? true} onChange={(e) => set({ isActive: e.target.checked })} /> Đang bật</label>
          </div>
          <button onClick={() => save.mutate()} disabled={save.isPending || !f.name.trim() || !f.content.trim()} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50">Lưu</button>
        </div>
      )}
    </section>
  );
};

const AdminHomePage = () => (
  <div className="space-y-6 max-w-4xl">
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Trang chủ</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1">Chỉnh tiêu đề, banner, lời chứng thực và bật/tắt các khối. Các con số ở đầu trang là số liệu thật, tự cập nhật.</p>
    </div>
    <SettingsCard />
    <BannersCard />
    <TestimonialsCard />
  </div>
);

export default AdminHomePage;

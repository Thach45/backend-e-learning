import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link2, Loader2 } from 'lucide-react';
import { publicProfileApi, type PublicProfileSettings } from '../../api/publicProfile';
import { useAuthStatus } from '../../hooks/useAuthStatus';

const input = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm';

/** Bật/tắt hồ sơ công khai và chọn phần được hiển thị. Mặc định TẮT; email và số điện thoại không bao giờ hiển thị. */
const PublicProfileForm = () => {
  const qc = useQueryClient();
  const { user } = useAuthStatus();
  const { data } = useQuery({ queryKey: ['profile', 'public'], queryFn: publicProfileApi.mine });
  const [f, setF] = useState<PublicProfileSettings | null>(null);
  useEffect(() => { if (data) setF(data); }, [data]);
  const save = useMutation({
    mutationFn: (b: PublicProfileSettings) => publicProfileApi.save({ ...b, headline: b.headline?.trim() || null, bio: b.bio?.trim() || null }),
    onSuccess: () => { toast.success('Đã lưu.'); qc.invalidateQueries({ queryKey: ['profile', 'public'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Không lưu được.'),
  });
  if (!f) return <Loader2 className="animate-spin" />;
  const url = user?.id ? `${window.location.origin}/u/${user.id}` : '';
  return (
    <div className="space-y-4 text-sm">
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={f.isPublic} onChange={(e) => setF({ ...f, isPublic: e.target.checked })} /> Cho phép người khác xem hồ sơ học tập của tôi</label>
      {f.isPublic && (
        <>
          <label className="block space-y-1"><span className="text-xs text-slate-500">Giới thiệu ngắn</span><input className={input} maxLength={100} value={f.headline ?? ''} onChange={(e) => setF({ ...f, headline: e.target.value })} /></label>
          <label className="block space-y-1"><span className="text-xs text-slate-500">Về tôi</span><textarea rows={3} className={input} maxLength={500} value={f.bio ?? ''} onChange={(e) => setF({ ...f, bio: e.target.value })} /></label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.showCourses} onChange={(e) => setF({ ...f, showCourses: e.target.checked })} /> Hiện khoá đã hoàn thành</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.showBadges} onChange={(e) => setF({ ...f, showBadges: e.target.checked })} /> Hiện huy hiệu</label>
          </div>
          {url && <p className="flex items-center gap-2 text-slate-500"><Link2 size={14} /> <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">{url}</a></p>}
        </>
      )}
      <p className="text-xs text-slate-400">Chỉ tên, ảnh đại diện và các phần bạn chọn được hiển thị. Email và số điện thoại luôn được giữ kín.</p>
      <button onClick={() => save.mutate(f)} disabled={save.isPending} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50">Lưu</button>
    </div>
  );
};

export default PublicProfileForm;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Plus } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useCampaigns } from '../../hooks/useEmailCampaigns';
import { STATUS_LABELS, type Audience, type CampaignStatus } from '../../api/emailCampaigns';

const audienceLabel = (a: Audience) => {
  switch (a.type) {
    case 'ALL_USERS': return 'Tất cả người dùng';
    case 'ROLE': return a.role === 'CLIENT' ? 'Tất cả học viên' : 'Tất cả giảng viên';
    case 'COURSE_ENROLLEES': return 'Học viên một khóa học';
    case 'INSTRUCTOR_STUDENTS': return 'Học viên của tôi';
    case 'INTEREST_TAG': return 'Theo chủ đề quan tâm';
    case 'SPECIFIC_USERS': return `${a.userIds.length} người cụ thể`;
  }
};

const CampaignList = ({ role, basePath }: { role: 'admin' | 'instructor'; basePath: string }) => {
  const admin = role === 'admin';
  const [status, setStatus] = useState<CampaignStatus | ''>('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCampaigns({ page, limit: 15, status: status || undefined });
  const { data: pending } = useCampaigns(admin ? { status: 'PENDING_APPROVAL', limit: 1 } : undefined);
  const pendingCount = admin ? pending?.total ?? 0 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Mail size={28} className="text-indigo-600" /> {admin ? 'Email gửi người dùng' : 'Thông báo email cho học viên'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {admin
              ? 'Soạn và gửi thư tới người dùng. Thư của giảng viên cần bạn duyệt trước khi gửi.'
              : 'Gửi thư cho học viên trong khóa học của bạn. Thư cần admin duyệt trước khi được gửi.'}
          </p>
        </div>
        <Link to={`${basePath}/new`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
          <Plus size={16} /> Soạn email mới
        </Link>
      </div>

      {admin && pendingCount > 0 && status !== 'PENDING_APPROVAL' && (
        <button onClick={() => { setStatus('PENDING_APPROVAL'); setPage(1); }} className="w-full text-left text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 hover:bg-amber-100">
          Có <strong>{pendingCount}</strong> chiến dịch của giảng viên đang chờ bạn duyệt. Bấm để xem.
        </button>
      )}

      <div className="flex items-center gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value as CampaignStatus | ''); setPage(1); }} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm">
          <option value="">Tất cả trạng thái</option>
          {(Object.keys(STATUS_LABELS) as CampaignStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s].label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
        {isLoading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">Tiêu đề</th>
                {admin && <th className="px-4 py-3">Người soạn</th>}
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Đã gửi</th>
                <th className="px-4 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`${basePath}/${c.id}`} className="text-indigo-700 dark:text-indigo-400 hover:underline">{c.subject}</Link>
                    {c.isServiceNotice && <span className="ml-2 text-[10px] font-bold text-red-600 border border-red-200 rounded px-1">DỊCH VỤ</span>}
                  </td>
                  {admin && <td className="px-4 py-3">{c.sender.name}</td>}
                  <td className="px-4 py-3">{audienceLabel(c.audience)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-right">{c.totalRecipients ? `${c.sentCount}/${c.totalRecipients}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(c.updatedAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              ))}
              {data?.data.length === 0 && <tr><td colSpan={admin ? 6 : 5} className="px-4 py-12 text-center text-slate-400">Chưa có chiến dịch nào.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border disabled:opacity-40">Trước</button>
          <span>Trang {page}/{data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border disabled:opacity-40">Sau</button>
        </div>
      )}
    </div>
  );
};

export default CampaignList;

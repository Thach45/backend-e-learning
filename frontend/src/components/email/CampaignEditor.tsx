import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, Clock, Loader2, Save, Send, TestTube2, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import SimpleMarkdown from '../common/SimpleMarkdown';
import AudiencePicker from './AudiencePicker';
import StatusBadge from './StatusBadge';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import {
  useApproveCampaign,
  useCampaign,
  useCancelCampaign,
  useCreateCampaign,
  useDeleteCampaign,
  usePreviewAudience,
  useRejectCampaign,
  useSendCampaign,
  useSubmitCampaign,
  useTestSendCampaign,
  useUpdateCampaign,
} from '../../hooks/useEmailCampaigns';
import { EDITABLE_STATUSES, type Audience } from '../../api/emailCampaigns';

const inputCls =
  'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60';
const btn = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors';

const audienceValid = (a: Audience) =>
  a.type === 'COURSE_ENROLLEES' ? !!a.courseId : a.type === 'INTEREST_TAG' ? !!a.tagId : a.type === 'SPECIFIC_USERS' ? a.userIds.length > 0 : true;

interface Props {
  role: 'admin' | 'instructor';
  basePath: string; // ví dụ /admin/email-campaigns hoặc /instructor/announcements
}

/**
 * Soạn, gửi duyệt, duyệt/từ chối, gửi và huỷ một chiến dịch email.
 * Quy tắc hiển thị khớp với server: sửa sau khi duyệt sẽ mất duyệt; giảng viên phải chờ admin duyệt mới gửi được.
 */
const CampaignEditor = ({ role, basePath }: Props) => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  const admin = role === 'admin';

  const { data: campaign, isLoading } = useCampaign(isNew ? undefined : id);
  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const del = useDeleteCampaign();
  const submit = useSubmitCampaign();
  const approve = useApproveCampaign();
  const reject = useRejectCampaign();
  const send = useSendCampaign();
  const cancel = useCancelCampaign();
  const testSend = useTestSendCampaign();
  const previewAudience = usePreviewAudience();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>(admin ? { type: 'ALL_USERS' } : { type: 'INSTRUCTOR_STUDENTS' });
  const [isServiceNotice, setIsServiceNotice] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    setSubject(campaign.subject);
    setBody(campaign.body);
    setAudience(campaign.audience);
    setIsServiceNotice(campaign.isServiceNotice);
    setDirty(false);
  }, [campaign?.id, campaign?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isNew && isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>;

  const isOwner = isNew || campaign?.senderId === user?.id;
  const editable = isNew || (isOwner && !!campaign && EDITABLE_STATUSES.includes(campaign.status));
  const status = campaign?.status;
  const canSubmit = !!campaign && isOwner && (status === 'DRAFT' || status === 'REJECTED');
  const canSend = !!campaign && isOwner && status === 'APPROVED' && campaign.isApproved;
  const canCancel = !!campaign && (isOwner || admin) && ['PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'SENDING'].includes(status!);
  const canDelete = !!campaign && (isOwner || admin) && ['DRAFT', 'REJECTED', 'CANCELLED'].includes(status!);
  const willLoseApproval = !!campaign && ['PENDING_APPROVAL', 'APPROVED', 'SCHEDULED'].includes(status!);
  const formOk = subject.trim().length > 0 && body.trim().length > 0 && audienceValid(audience);

  const payload = { subject: subject.trim(), body: body.trim(), audience, ...(admin ? { isServiceNotice } : {}) };

  const onSave = () => {
    if (!formOk) { toast.error('Hãy nhập tiêu đề, nội dung và chọn đối tượng nhận.'); return; }
    if (isNew) create.mutate(payload, { onSuccess: (c) => navigate(`${basePath}/${c.id}`, { replace: true }) });
    else update.mutate({ id: id!, body: payload }, { onSuccess: () => setDirty(false) });
  };

  const mark = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); };
  const busy = create.isPending || update.isPending;
  const preview = body.replace(/\{\{\s*name\s*\}\}/g, 'Nguyễn Văn A').replace(/\{\{\s*courseTitle\s*\}\}/g, 'Tên khóa học');

  return (
    <div className="space-y-6 max-w-5xl">
      <button onClick={() => navigate(basePath)} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{isNew ? 'Soạn email mới' : 'Chiến dịch email'}</h1>
        {campaign && <StatusBadge status={campaign.status} />}
      </div>

      {campaign?.rejectedReason && status === 'REJECTED' && (
        <div className="flex gap-2 text-sm bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">
          <X size={16} className="mt-0.5 shrink-0" /> <span><strong>Bị từ chối:</strong> {campaign.rejectedReason}</span>
        </div>
      )}
      {editable && willLoseApproval && (
        <div className="flex gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Nếu bạn sửa nội dung hoặc đối tượng, chiến dịch sẽ <strong>mất duyệt</strong> và quay về bản nháp để gửi duyệt lại.
        </div>
      )}
      {!isOwner && campaign && (
        <p className="text-sm text-slate-500">Người soạn: <strong>{campaign.sender.name}</strong> (bạn chỉ xem, duyệt hoặc từ chối được).</p>
      )}
      {campaign && ['SENDING', 'SENT', 'SCHEDULED'].includes(campaign.status) && (
        <div className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap gap-x-6 gap-y-1">
          <span>Tổng người nhận: <strong>{campaign.totalRecipients}</strong></span>
          <span>Đã gửi: <strong className="text-emerald-700">{campaign.sentCount}</strong></span>
          <span>Lỗi: <strong className="text-red-600">{campaign.failedCount}</strong></span>
          {campaign.scheduledAt && <span>Lịch gửi: <strong>{new Date(campaign.scheduledAt).toLocaleString('vi-VN')}</strong></span>}
          {campaign.status === 'SENDING' && campaign.sentCount + campaign.failedCount < campaign.totalRecipients && (
            <span className="text-slate-500">Mail còn lại có thể được hoãn sang ngày sau nếu hết hạn mức gửi trong ngày.</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Tiêu đề</label>
            <input value={subject} onChange={(e) => mark(setSubject)(e.target.value)} disabled={!editable} maxLength={200} placeholder="Ví dụ: Bài giảng mới đã có trong khóa học" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nội dung</label>
            <textarea value={body} onChange={(e) => mark(setBody)(e.target.value)} disabled={!editable} rows={12} maxLength={20000}
              placeholder={'Xin chào {{name}},\n\nMình vừa cập nhật **bài giảng mới**...\n\n- Ý một\n- Ý hai\n\n[Xem ngay](https://...)'} className={`${inputCls} font-mono`} />
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ: <code>## Tiêu đề</code>, <code>**đậm**</code>, <code>*nghiêng*</code>, danh sách <code>- ...</code>, liên kết <code>[chữ](https://...)</code>. Biến: <code>{'{{name}}'}</code>, <code>{'{{courseTitle}}'}</code>. Không dùng HTML.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Gửi cho ai</label>
            <AudiencePicker role={role} value={audience} onChange={mark(setAudience)} disabled={!editable} />
          </div>
          {admin && (
            <label className="flex gap-3 items-start p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm cursor-pointer">
              <input type="checkbox" checked={isServiceNotice} onChange={(e) => mark(setIsServiceNotice)(e.target.checked)} disabled={!editable} className="mt-1 w-4 h-4 accent-indigo-600" />
              <span><strong>Thông báo dịch vụ</strong> (ví dụ đổi điều khoản): gửi cả người đã chọn ngừng nhận thư. Chỉ dùng cho thông tin bắt buộc phải báo.</span>
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Xem trước</label>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <div className="bg-indigo-600 text-white px-5 py-3 font-extrabold tracking-wide">U Đê Mê</div>
            <div className="p-5 text-sm text-slate-700 dark:text-slate-200 min-h-[200px]">
              <p className="text-xs text-slate-400 mb-3">Tiêu đề: {subject.replace(/\{\{\s*name\s*\}\}/g, 'Nguyễn Văn A') || '(chưa có)'}</p>
              {body.trim() ? <SimpleMarkdown source={preview} /> : <p className="text-slate-400">Nội dung sẽ hiện ở đây.</p>}
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 text-xs text-slate-400">
              {isServiceNotice ? 'Đây là thông báo dịch vụ.' : 'Bạn nhận thư này vì có tài khoản tại U Đê Mê. Ngừng nhận thư này.'}
            </div>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {editable && (
          <button onClick={onSave} disabled={busy || !formOk} className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isNew ? 'Lưu bản nháp' : dirty ? 'Lưu thay đổi' : 'Đã lưu'}
          </button>
        )}
        {campaign && isOwner && (
          <>
            <button onClick={() => previewAudience.mutate(campaign.id)} disabled={previewAudience.isPending || dirty} className={`${btn} border border-slate-200 dark:border-slate-700`} title={dirty ? 'Lưu trước khi đếm' : ''}>
              <Users size={16} /> Đếm người nhận
            </button>
            <button onClick={() => testSend.mutate(campaign.id)} disabled={testSend.isPending || dirty} className={`${btn} border border-slate-200 dark:border-slate-700`}>
              <TestTube2 size={16} /> Gửi thử cho tôi
            </button>
          </>
        )}
        {canSubmit && (
          <button onClick={() => submit.mutate(campaign!.id)} disabled={submit.isPending || dirty} className={`${btn} bg-amber-500 text-white hover:bg-amber-600`}>
            <Check size={16} /> {admin ? 'Duyệt và chuẩn bị gửi' : 'Gửi admin duyệt'}
          </button>
        )}
        {canCancel && (
          <button onClick={() => window.confirm('Huỷ chiến dịch này? Mail chưa gửi sẽ bị bỏ.') && cancel.mutate(campaign!.id)} disabled={cancel.isPending} className={`${btn} border border-red-200 text-red-700 hover:bg-red-50`}>
            <X size={16} /> Huỷ chiến dịch
          </button>
        )}
        {canDelete && (
          <button onClick={() => window.confirm('Xoá hẳn chiến dịch này?') && del.mutate(campaign!.id, { onSuccess: () => navigate(basePath) })} className={`${btn} text-slate-500 hover:text-red-600`}>
            <Trash2 size={16} /> Xoá
          </button>
        )}
      </div>

      {previewAudience.data && (
        <div className="text-sm bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 rounded-xl p-3">
          Sẽ gửi tới <strong>{previewAudience.data.count}</strong> người
          {previewAudience.data.sample.length > 0 && <> (ví dụ: {previewAudience.data.sample.join(', ')})</>}. Đã loại người ngừng nhận thư, tài khoản bị khoá và địa chỉ bị chặn.
        </div>
      )}

      {/* Admin duyệt / từ chối chiến dịch của giảng viên */}
      {admin && campaign && status === 'PENDING_APPROVAL' && !isOwner && (
        <section className="border border-amber-200 bg-amber-50 dark:bg-slate-900 rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Chờ bạn duyệt</h2>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2} placeholder="Lý do từ chối (bắt buộc khi từ chối, tối thiểu 5 ký tự)" className={inputCls} />
          <div className="flex gap-3">
            <button onClick={() => approve.mutate(campaign.id)} disabled={approve.isPending} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}><Check size={16} /> Duyệt</button>
            <button onClick={() => reject.mutate({ id: campaign.id, reason: rejectReason.trim() })} disabled={reject.isPending || rejectReason.trim().length < 5} className={`${btn} bg-red-600 text-white hover:bg-red-700`}><X size={16} /> Từ chối</button>
          </div>
        </section>
      )}

      {/* Gửi: chỉ khi đã được duyệt */}
      {canSend && (
        <section className="border border-emerald-200 bg-emerald-50 dark:bg-slate-900 rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Đã được duyệt, sẵn sàng gửi</h2>
          <div className="flex flex-wrap items-end gap-3">
            <button onClick={() => send.mutate({ id: campaign!.id })} disabled={send.isPending || dirty} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}><Send size={16} /> Gửi ngay</button>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Hoặc hẹn giờ</label>
              <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className={inputCls} />
            </div>
            <button onClick={() => send.mutate({ id: campaign!.id, scheduledAt: new Date(scheduleAt).toISOString() })} disabled={!scheduleAt || send.isPending || dirty} className={`${btn} border border-emerald-300 text-emerald-800`}>
              <Clock size={16} /> Hẹn giờ gửi
            </button>
          </div>
          <p className="text-xs text-slate-500">Mail được gửi dần theo hạn mức của ngày; phần còn lại tự chuyển sang ngày hôm sau.</p>
        </section>
      )}
    </div>
  );
};

export default CampaignEditor;

import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { useCreateReport } from '../../hooks/useModeration';
import { REPORT_REASON_LABELS, type ReportReason, type ReportTargetType } from '../../api/moderation';

type Props = {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
};

const ReportButton = ({ targetType, targetId, className }: Props) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);
  const createReport = useCreateReport();

  const submit = () => {
    createReport.mutate(
      { targetType, targetId, reason, details: details.trim() || undefined },
      {
        onSuccess: () => {
          setSent(true);
          setOpen(false);
        },
      },
    );
  };

  if (sent) {
    return <span className="text-xs text-slate-400 dark:text-slate-500">Đã báo cáo</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          'inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-rose-600 transition-colors'
        }
        title="Báo cáo vi phạm"
      >
        <Flag size={12} /> Báo cáo
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Báo cáo nội dung vi phạm</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Đóng">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {(Object.keys(REPORT_REASON_LABELS) as ReportReason[]).map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input type="radio" name="report-reason" checked={reason === key} onChange={() => setReason(key)} />
                  {REPORT_REASON_LABELS[key]}
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Mô tả thêm (không bắt buộc)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={submit}
                disabled={createReport.isPending}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;

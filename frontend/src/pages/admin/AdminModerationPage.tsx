import { useState } from 'react';
import { Flag, Loader2, Trash2, CheckCircle2, XCircle, MessageSquare, HelpCircle, Search } from 'lucide-react';
import { useAdminReports, useAdminModerationComments, useAdminModerationQuestions, useResolveReport, useRemoveContent } from '../../hooks/useModeration';
import ExportCsvButton from '../../components/admin/ExportCsvButton';
import {
  REPORT_REASON_LABELS,
  REPORT_TARGET_LABELS,
  type ReportStatus,
  type ContentReport,
} from '../../api/moderation';

type Tab = 'reports' | 'comments' | 'questions';

const formatDateTime = (iso: string) => new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

const STATUS_LABEL: Record<ReportStatus, { text: string; cls: string }> = {
  PENDING: { text: 'Chờ xử lý', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  RESOLVED: { text: 'Đã gỡ nội dung', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  DISMISSED: { text: 'Đã bỏ qua', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
};

const inputCls =
  'px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

const Pager = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) =>
  totalPages > 1 ? (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-50"
      >
        Trước
      </button>
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Trang {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-50"
      >
        Sau
      </button>
    </div>
  ) : null;

const Loading = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <div className="py-12 text-center text-slate-500 dark:text-slate-400">{text}</div>
);

// ===== Tab: Báo cáo vi phạm =====
const ReportsTab = () => {
  const [status, setStatus] = useState<ReportStatus | ''>('PENDING');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminReports({ page, limit: 10, status: status || undefined });
  const resolve = useResolveReport();
  const [noteById, setNoteById] = useState<Record<string, string>>({});

  const act = (report: ContentReport, action: 'REMOVE_CONTENT' | 'DISMISS') => {
    if (action === 'REMOVE_CONTENT' && !window.confirm('Gỡ nội dung này? Hành động không thể hoàn tác.')) return;
    resolve.mutate({ id: report.id, action, note: noteById[report.id]?.trim() || undefined });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['PENDING', 'RESOLVED', 'DISMISSED', ''] as const).map((s) => (
            <button
              key={s || 'ALL'}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
                status === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {s ? STATUS_LABEL[s].text : 'Tất cả'}
            </button>
          ))}
        </div>
        <ExportCsvButton resource="reports" params={{ status: status || undefined }} />
      </div>

      {isLoading ? (
        <Loading />
      ) : !data || data.data.length === 0 ? (
        <Empty text="Không có báo cáo nào" />
      ) : (
        <div className="space-y-3">
          {data.data.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full font-semibold ${STATUS_LABEL[report.status].cls}`}>
                  {STATUS_LABEL[report.status].text}
                </span>
                <span className="px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {REPORT_TARGET_LABELS[report.targetType]}
                </span>
                <span className="px-2 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                  {REPORT_REASON_LABELS[report.reason]}
                </span>
                {report.reportCount > 1 && (
                  <span className="text-slate-500 dark:text-slate-400">{report.reportCount} người báo cáo nội dung này</span>
                )}
                <span className="ml-auto text-slate-400">{formatDateTime(report.createdAt)}</span>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 space-y-1">
                <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words">
                  {report.contentSnapshot || '(không có nội dung)'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {report.targetAuthor ? `Tác giả: ${report.targetAuthor.name} (${report.targetAuthor.email})` : ''}
                  {report.targetContext ? ` • ${report.targetContext}` : ''}
                </p>
                {!report.targetExists && <p className="text-xs font-semibold text-slate-500">Nội dung đã không còn tồn tại</p>}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Người báo cáo: <strong>{report.reporter.name}</strong> ({report.reporter.email})
                {report.details ? ` — "${report.details}"` : ''}
              </p>

              {report.status === 'PENDING' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={noteById[report.id] ?? ''}
                    onChange={(e) => setNoteById((prev) => ({ ...prev, [report.id]: e.target.value }))}
                    placeholder="Ghi chú xử lý (không bắt buộc)"
                    maxLength={500}
                    className={`${inputCls} flex-1 min-w-[200px]`}
                  />
                  <button
                    onClick={() => act(report, 'REMOVE_CONTENT')}
                    disabled={resolve.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Gỡ nội dung
                  </button>
                  <button
                    onClick={() => act(report, 'DISMISS')}
                    disabled={resolve.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Bỏ qua
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Xử lý bởi {report.handledBy?.name ?? 'admin'}
                  {report.handledAt ? ` lúc ${formatDateTime(report.handledAt)}` : ''}
                  {report.resolutionNote ? ` — ${report.resolutionNote}` : ''}
                </p>
              )}
            </div>
          ))}
          <Pager page={page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
};

// ===== Tab: Bình luận =====
const CommentsTab = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminModerationComments({ page, limit: 10, search: search || undefined });
  const remove = useRemoveContent();

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm theo nội dung, tên hoặc email..."
          className={`${inputCls} w-full pl-9`}
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : !data || data.data.length === 0 ? (
        <Empty text="Không có bình luận nào" />
      ) : (
        <div className="space-y-3">
          {data.data.map((c) => (
            <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words">{c.content}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {c.user.name} ({c.user.email}) • {c.context} • {formatDateTime(c.createdAt)}
                  {c.parentId ? ' • phản hồi' : ''} • {c._count.replies} phản hồi • {c._count.reactions} reaction
                </p>
              </div>
              <button
                onClick={() => {
                  const extra = c._count.replies > 0 ? ` Cả ${c._count.replies} phản hồi cũng sẽ bị xóa.` : '';
                  if (window.confirm(`Xóa bình luận này?${extra}`)) remove.mutate({ kind: 'comment', id: c.id });
                }}
                disabled={remove.isPending}
                className="self-start p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg disabled:opacity-50"
                aria-label="Xóa bình luận"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <Pager page={page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
};

// ===== Tab: Hỏi đáp =====
const QuestionsTab = () => {
  const [search, setSearch] = useState('');
  const [resolved, setResolved] = useState<'' | 'true' | 'false'>('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminModerationQuestions({
    page,
    limit: 10,
    search: search || undefined,
    resolved: resolved || undefined,
  });
  const remove = useRemoveContent();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-md min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tiêu đề, nội dung hoặc người hỏi..."
            className={`${inputCls} w-full pl-9`}
          />
        </div>
        <select
          value={resolved}
          onChange={(e) => {
            setResolved(e.target.value as '' | 'true' | 'false');
            setPage(1);
          }}
          className={inputCls}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="false">Chưa giải quyết</option>
          <option value="true">Đã giải quyết</option>
        </select>
      </div>

      {isLoading ? (
        <Loading />
      ) : !data || data.data.length === 0 ? (
        <Empty text="Không có câu hỏi nào" />
      ) : (
        <div className="space-y-3">
          {data.data.map((q) => (
            <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {q.title}
                    {q.isResolved && (
                      <span className="ml-2 text-xs font-semibold text-emerald-600">Đã giải quyết</span>
                    )}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">{q.content}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {q.user.name} ({q.user.email}) • {q.context} • {formatDateTime(q.createdAt)} • {q.answers.length} câu trả lời
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Xóa câu hỏi này cùng ${q.answers.length} câu trả lời?`))
                      remove.mutate({ kind: 'question', id: q.id });
                  }}
                  disabled={remove.isPending}
                  className="self-start p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg disabled:opacity-50"
                  aria-label="Xóa câu hỏi"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {q.answers.length > 0 && (
                <div className="ml-4 pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-2">
                  {q.answers.map((a) => (
                    <div key={a.id} className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">{a.content}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {a.user.name}
                          {a.isInstructorAnswer ? ' (giảng viên)' : ''} • {formatDateTime(a.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm('Xóa câu trả lời này?')) remove.mutate({ kind: 'answer', id: a.id });
                        }}
                        disabled={remove.isPending}
                        className="self-start p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg disabled:opacity-50"
                        aria-label="Xóa câu trả lời"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Pager page={page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
};

const TABS: { key: Tab; label: string; icon: typeof Flag }[] = [
  { key: 'reports', label: 'Báo cáo vi phạm', icon: Flag },
  { key: 'comments', label: 'Bình luận', icon: MessageSquare },
  { key: 'questions', label: 'Hỏi đáp', icon: HelpCircle },
];

const AdminModerationPage = () => {
  const [tab, setTab] = useState<Tab>('reports');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <Flag size={28} className="text-indigo-600" /> Kiểm duyệt nội dung
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Xử lý báo cáo vi phạm và gỡ bình luận, hỏi đáp không phù hợp. Đánh giá khóa học được quản lý ở mục Đánh giá.
        </p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'reports' && <ReportsTab />}
      {tab === 'comments' && <CommentsTab />}
      {tab === 'questions' && <QuestionsTab />}
    </div>
  );
};

export default AdminModerationPage;

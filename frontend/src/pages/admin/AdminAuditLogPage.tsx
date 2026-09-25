import { useState } from 'react';
import { ScrollText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import ExportCsvButton from '../../components/admin/ExportCsvButton';

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'medium' });

const AdminAuditLogPage = () => {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const limit = 20;

  const { data, isLoading } = useAuditLogs({
    page,
    limit,
    action: action || undefined,
    targetType: targetType || undefined,
  });

  const logs = data?.data ?? [];

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <ScrollText size={28} className="text-indigo-600" /> Nhật ký hoạt động
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Lịch sử các thao tác quan trọng trong hệ thống</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={action}
          onChange={(e) => handleFilterChange(setAction)(e.target.value)}
          placeholder="Lọc theo action (VD: user.delete)"
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={targetType}
          onChange={(e) => handleFilterChange(setTargetType)(e.target.value)}
          placeholder="Lọc theo đối tượng (VD: Course)"
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="ml-auto">
          <ExportCsvButton
            resource="audit-logs"
            params={{ action: action || undefined, targetType: targetType || undefined }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Người thực hiện</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Đối tượng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Chi tiết</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      Chưa có nhật ký nào
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {log.actor ? (
                          <div>
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{log.actor.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{log.actor.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">Hệ thống</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-200">
                          {log.action}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {log.targetType ? `${log.targetType}${log.targetId ? ` #${log.targetId.slice(0, 8)}` : ''}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[240px]">
                        {log.metadata ? (
                          <code className="block truncate" title={JSON.stringify(log.metadata, null, 2)}>
                            {JSON.stringify(log.metadata)}
                          </code>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{log.ipAddress || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Hiển thị <span className="font-semibold">{logs.length}</span> /{' '}
              <span className="font-semibold">{data.total}</span> bản ghi
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || isLoading}
                className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300 px-2">
                Trang {page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(data.totalPages, prev + 1))}
                disabled={page === data.totalPages || isLoading}
                className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogPage;

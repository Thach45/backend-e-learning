import { Download, Loader2 } from 'lucide-react';
import { useExportCsv } from '../../hooks/useAdminAnalytics';
import type { ExportResource } from '../../api/adminAnalytics';

type Props = {
  resource: ExportResource;
  params?: Record<string, string | undefined>;
  label?: string;
};

const ExportCsvButton = ({ resource, params, label = 'Xuất CSV' }: Props) => {
  const exportMutation = useExportCsv();

  return (
    <button
      type="button"
      onClick={() => exportMutation.mutate({ resource, params })}
      disabled={exportMutation.isPending}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
    >
      {exportMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {label}
    </button>
  );
};

export default ExportCsvButton;

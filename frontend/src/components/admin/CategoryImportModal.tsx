import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Loader2, Upload, X } from 'lucide-react';
import { csvTransferApi, type ImportResult } from '../../api/csvTransfer';

const LABEL = { created: 'Sẽ tạo', exists: 'Đã có', invalid: 'Lỗi' } as const;
const TONE = { created: 'text-emerald-700', exists: 'text-slate-500', invalid: 'text-red-600' } as const;

const CategoryImportModal = ({ onClose }: { onClose: () => void }) => {
  const qc = useQueryClient();
  const [csv, setCsv] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  const run = useMutation({
    mutationFn: (dryRun: boolean) => csvTransferApi.importCategories(csv ?? '', dryRun),
    onSuccess: (r) => {
      setResult(r);
      if (!r.dryRun) {
        toast.success(`Đã tạo ${r.created} danh mục.`);
        qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
        qc.invalidateQueries({ queryKey: ['categories'] });
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Không nhập được file.'),
  });

  const pick = async (file: File | undefined) => {
    setResult(null);
    if (!file) return;
    if (file.size > 500_000) return toast.error('File quá lớn (tối đa 500KB).');
    setFileName(file.name);
    setCsv(await file.text());
  };

  // Chỉ cho nhập thật sau khi đã chạy thử và không còn dòng lỗi nào chặn kết quả mong muốn
  const canCommit = !!result && result.dryRun && result.created > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Nhập danh mục từ CSV</h2>
          <button onClick={onClose} aria-label="Đóng" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            File cần cột <strong>tên</strong> và (tuỳ chọn) <strong>danh mục cha</strong>. Chỉ tạo mới, không sửa hay xoá danh mục đã có; tối đa 500 dòng, hai cấp. Luôn chạy thử trước khi nhập thật.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => csvTransferApi.downloadTemplate()} className="inline-flex items-center gap-2 px-3 py-2 border rounded-xl"><Download size={15} /> Tải file mẫu</button>
            <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer">
              <Upload size={15} /> {fileName || 'Chọn file .csv'}
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            </label>
            <button onClick={() => run.mutate(true)} disabled={!csv || run.isPending} className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold disabled:opacity-50">
              {run.isPending && run.variables === true ? <Loader2 size={15} className="animate-spin inline" /> : 'Chạy thử'}
            </button>
            <button onClick={() => run.mutate(false)} disabled={!canCommit || run.isPending} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50">Nhập thật</button>
          </div>

          {result && (
            <div className="space-y-3">
              <p className="font-semibold">
                {result.dryRun ? 'Kết quả chạy thử' : 'Đã nhập'}: {result.created} tạo mới · {result.existing} đã có · {result.invalid} lỗi (tổng {result.total} dòng)
              </p>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-left text-slate-500"><tr><th className="px-3 py-2">Dòng</th><th className="px-3 py-2">Tên</th><th className="px-3 py-2">Cha</th><th className="px-3 py-2">Kết quả</th></tr></thead>
                  <tbody>
                    {result.results.map((r) => (
                      <tr key={r.line} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2">{r.line}</td><td className="px-3 py-2">{r.name}</td><td className="px-3 py-2">{r.parent ?? '—'}</td>
                        <td className={`px-3 py-2 ${TONE[r.status]}`}>{LABEL[r.status]}{r.message ? `: ${r.message}` : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryImportModal;

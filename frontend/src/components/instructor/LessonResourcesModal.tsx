import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Languages, Loader2, Paperclip, Trash2, X } from 'lucide-react';
import { lessonResourcesApi } from '../../api/lessonResources';
import { uploadApi } from '../../api/upload';

const errMsg = (e: any) => e?.response?.data?.message ?? 'Thao tác thất bại.';
const fmtSize = (b: number | null) => (b == null ? '' : b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

/** Tài liệu đính kèm (PDF, slide, ZIP...) và phụ đề .vtt/.srt của một bài học. */
const LessonResourcesModal = ({ lessonId, lessonTitle, onClose }: { lessonId: string; lessonTitle: string; onClose: () => void }) => {
  const qc = useQueryClient();
  const key = ['lesson-resources', lessonId];
  const { data, isLoading } = useQuery({ queryKey: key, queryFn: () => lessonResourcesApi.list(lessonId) });
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const [progress, setProgress] = useState<number | null>(null);
  const [lang, setLang] = useState('vi');
  const [label, setLabel] = useState('Tiếng Việt');
  const [makeDefault, setMakeDefault] = useState(true);

  const addAttachment = useMutation({
    mutationFn: async (file: File) => {
      setProgress(0);
      const up = await uploadApi.uploadFile(file, setProgress);
      return lessonResourcesApi.addAttachment(lessonId, { title: file.name.replace(/\.[^.]+$/, '').slice(0, 150), fileName: file.name.slice(0, 200), url: up.url, sizeBytes: file.size });
    },
    onSuccess: () => { toast.success('Đã đính kèm tài liệu.'); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
    onSettled: () => setProgress(null),
  });
  const removeAttachment = useMutation({ mutationFn: (id: string) => lessonResourcesApi.removeAttachment(lessonId, id), onSuccess: refresh, onError: (e) => toast.error(errMsg(e)) });
  const saveSubtitle = useMutation({
    mutationFn: async (file: File) => lessonResourcesApi.saveSubtitle(lessonId, lang.trim(), { label: label.trim(), content: await file.text(), isDefault: makeDefault }),
    onSuccess: () => { toast.success('Đã lưu phụ đề.'); refresh(); qc.invalidateQueries({ queryKey: ['lesson-subtitles'] }); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const removeSubtitle = useMutation({ mutationFn: (l: string) => lessonResourcesApi.removeSubtitle(lessonId, l), onSuccess: () => { refresh(); qc.invalidateQueries({ queryKey: ['lesson-subtitles'] }); }, onError: (e) => toast.error(errMsg(e)) });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tài liệu và phụ đề</h2>
            <p className="text-sm text-slate-500 truncate">{lessonTitle}</p>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20} /></button>
        </div>

        {isLoading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div> : (
          <div className="p-5 space-y-8 text-sm">
            <section className="space-y-3">
              <h3 className="font-bold flex items-center gap-2"><Paperclip size={16} /> Tài liệu đính kèm ({data?.attachments.length ?? 0}/10)</h3>
              <p className="text-slate-500">PDF, Word, PowerPoint, Excel, ZIP/RAR, tối đa 50MB. Học viên đã ghi danh sẽ thấy trong trang học.</p>
              <ul className="space-y-2">
                {data?.attachments.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
                    <FileText size={16} className="text-slate-400" />
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-indigo-700 hover:underline">{a.title}</a>
                    <span className="text-xs text-slate-400">{fmtSize(a.sizeBytes)}</span>
                    <button onClick={() => window.confirm('Gỡ tài liệu này?') && removeAttachment.mutate(a.id)} className="text-slate-400 hover:text-red-600" aria-label="Gỡ"><Trash2 size={15} /></button>
                  </li>
                ))}
              </ul>
              <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer ${addAttachment.isPending ? 'opacity-60 pointer-events-none' : ''}`}>
                {addAttachment.isPending ? <><Loader2 size={15} className="animate-spin" /> Đang tải {progress ?? 0}%</> : <>+ Thêm tài liệu</>}
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) addAttachment.mutate(f); }} />
              </label>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold flex items-center gap-2"><Languages size={16} /> Phụ đề ({data?.subtitles.length ?? 0}/8)</h3>
              <p className="text-slate-500">Tải file .vtt hoặc .srt (tự chuyển sang WebVTT). Chọn cùng mã ngôn ngữ sẽ thay thế bản cũ. Chỉ hiện khi bài học là video tải lên, không áp dụng cho YouTube/Google Drive.</p>
              <ul className="space-y-2">
                {data?.subtitles.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{s.language}</span>
                    <span className="flex-1">{s.label}</span>
                    {s.isDefault && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Mặc định</span>}
                    <button onClick={() => window.confirm('Xoá phụ đề này?') && removeSubtitle.mutate(s.language)} className="text-slate-400 hover:text-red-600" aria-label="Xoá"><Trash2 size={15} /></button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-end gap-3">
                <label className="space-y-1"><span className="text-xs text-slate-500">Mã ngôn ngữ</span>
                  <input value={lang} onChange={(e) => setLang(e.target.value)} maxLength={10} placeholder="vi, en, pt-BR" className="block w-28 px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 rounded-xl" /></label>
                <label className="space-y-1"><span className="text-xs text-slate-500">Tên hiển thị</span>
                  <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={50} className="block w-40 px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 rounded-xl" /></label>
                <label className="flex items-center gap-2 pb-2"><input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} /> Mặc định</label>
                <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold cursor-pointer ${saveSubtitle.isPending || !lang.trim() || !label.trim() ? 'opacity-50 pointer-events-none' : ''}`}>
                  {saveSubtitle.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Chọn file & lưu'}
                  <input type="file" className="hidden" accept=".vtt,.srt,text/vtt" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) saveSubtitle.mutate(f); }} />
                </label>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonResourcesModal;

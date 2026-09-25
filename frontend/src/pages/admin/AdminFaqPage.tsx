import { useState } from 'react';
import { HelpCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  useCreateFaqCategory, useCreateFaqItem, useDeleteFaqCategory, useDeleteFaqItem, useFaqAdmin, useUpdateFaqCategory, useUpdateFaqItem,
} from '../../hooks/useSupport';

const inp = 'px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200';

const ItemForm = ({ categoryId, onDone }: { categoryId: string; onDone: () => void }) => {
  const create = useCreateFaqItem();
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  return (
    <div className="mt-3 space-y-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder="Câu hỏi" className={`${inp} w-full`} />
      <textarea value={a} onChange={(e) => setA(e.target.value)} rows={4} placeholder="Câu trả lời (hỗ trợ **đậm**, danh sách, [liên kết](https://...))" className={`${inp} w-full font-mono`} />
      <div className="flex gap-2">
        <button onClick={() => create.mutate({ categoryId, question: q.trim(), answer: a.trim(), isPublished: true }, { onSuccess: onDone })} disabled={q.trim().length < 3 || !a.trim() || create.isPending} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50">Thêm</button>
        <button onClick={onDone} className="px-4 py-2 rounded-lg border text-sm">Huỷ</button>
      </div>
    </div>
  );
};

const AdminFaqPage = () => {
  const { data, isLoading } = useFaqAdmin();
  const createCat = useCreateFaqCategory();
  const updateCat = useUpdateFaqCategory();
  const delCat = useDeleteFaqCategory();
  const updateItem = useUpdateFaqItem();
  const delItem = useDeleteFaqItem();
  const [newCat, setNewCat] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3"><HelpCircle size={28} className="text-indigo-600" /> Câu hỏi thường gặp</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Nội dung hiển thị ở Trung tâm trợ giúp (/help). Câu chưa xuất bản sẽ được ẩn.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (newCat.trim()) createCat.mutate({ name: newCat.trim(), orderIndex: (data?.length ?? 0) + 1 }, { onSuccess: () => setNewCat('') }); }} className="flex gap-3">
        <input value={newCat} onChange={(e) => setNewCat(e.target.value)} maxLength={100} placeholder="Tên danh mục mới (ví dụ: Thanh toán)" className={`${inp} flex-1`} />
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"><Plus size={16} /> Thêm danh mục</button>
      </form>

      {isLoading ? <Loader2 className="animate-spin text-indigo-600" /> : (
        <div className="space-y-6">
          {data?.map((cat) => (
            <section key={cat.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-3">
                <input defaultValue={cat.name} onBlur={(e) => e.target.value.trim() && e.target.value !== cat.name && updateCat.mutate({ id: cat.id, body: { name: e.target.value.trim() } })} className={`${inp} font-semibold flex-1 min-w-[160px]`} />
                <label className="text-xs text-slate-500">Thứ tự <input type="number" min={0} defaultValue={cat.orderIndex} onBlur={(e) => Number(e.target.value) !== cat.orderIndex && updateCat.mutate({ id: cat.id, body: { orderIndex: Number(e.target.value) } })} className={`${inp} w-20 ml-1`} /></label>
                <button onClick={() => window.confirm(`Xoá danh mục "${cat.name}" và ${cat.faqs.length} câu hỏi bên trong?`) && delCat.mutate(cat.id)} className="p-2 text-slate-400 hover:text-red-600" aria-label="Xoá danh mục"><Trash2 size={16} /></button>
              </div>

              <ul className="mt-4 space-y-3">
                {cat.faqs.map((f) => (
                  <li key={f.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-2">
                    <input defaultValue={f.question} onBlur={(e) => e.target.value.trim().length >= 3 && e.target.value !== f.question && updateItem.mutate({ id: f.id, body: { question: e.target.value.trim() } })} className={`${inp} w-full font-medium`} />
                    <textarea defaultValue={f.answer} rows={3} onBlur={(e) => e.target.value.trim() && e.target.value !== f.answer && updateItem.mutate({ id: f.id, body: { answer: e.target.value.trim() } })} className={`${inp} w-full font-mono`} />
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={f.isPublished} onChange={(e) => updateItem.mutate({ id: f.id, body: { isPublished: e.target.checked } })} className="accent-indigo-600" /> Xuất bản</label>
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-slate-500">Thứ tự <input type="number" min={0} defaultValue={f.orderIndex} onBlur={(e) => Number(e.target.value) !== f.orderIndex && updateItem.mutate({ id: f.id, body: { orderIndex: Number(e.target.value) } })} className={`${inp} w-16 ml-1`} /></label>
                        <button onClick={() => window.confirm('Xoá câu hỏi này?') && delItem.mutate(f.id)} className="text-slate-400 hover:text-red-600" aria-label="Xoá"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {adding === cat.id ? <ItemForm categoryId={cat.id} onDone={() => setAdding(null)} /> : (
                <button onClick={() => setAdding(cat.id)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:underline"><Plus size={15} /> Thêm câu hỏi</button>
              )}
            </section>
          ))}
          {data?.length === 0 && <p className="text-center text-slate-400 py-12">Chưa có danh mục nào. Hãy tạo danh mục đầu tiên.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminFaqPage;

import { useState } from 'react';
import { Loader2, Plus, Tags, Trash2 } from 'lucide-react';
import { useAdminTags, useCreateTag, useDeleteTag, useUpdateTag } from '../../hooks/useTags';
import { useCategories } from '../../hooks/useCategories';
import { TAG_TYPE_LABELS, type TagType } from '../../api/tags';
import type { Category } from '../../api/categories';

const inputCls =
  'px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500';

const flatten = (cats: Category[] = [], depth = 0): { id: string; name: string }[] =>
  cats.flatMap((c) => [{ id: c.id, name: `${'— '.repeat(depth)}${c.name}` }, ...flatten(c.children ?? [], depth + 1)]);

const AdminTagsPage = () => {
  const { data: tags, isLoading } = useAdminTags();
  const { data: categories } = useCategories();
  const create = useCreateTag();
  const update = useUpdateTag();
  const remove = useDeleteTag();

  const [name, setName] = useState('');
  const [type, setType] = useState<TagType>('SKILL');
  const [categoryId, setCategoryId] = useState('');

  const cats = flatten(categories);
  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name.replace(/^(— )+/, '') ?? '—';

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;
    create.mutate(
      { name: name.trim(), type, categoryId: categoryId || null },
      { onSuccess: () => { setName(''); setCategoryId(''); } },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <Tags size={28} className="text-indigo-600" /> Thẻ kỹ năng
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Bộ thẻ dùng chung cho khóa học và hồ sơ học tập của người dùng. Giảng viên gán thẻ cho khóa, học viên chọn thẻ quan tâm.
        </p>
      </div>

      <form onSubmit={onCreate} className="flex flex-wrap items-end gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tên thẻ</label>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="Ví dụ: Python" className={`${inputCls} w-full`} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Loại</label>
          <select value={type} onChange={(e) => setType(e.target.value as TagType)} className={inputCls}>
            {(Object.keys(TAG_TYPE_LABELS) as TagType[]).map((t) => <option key={t} value={t}>{TAG_TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Danh mục liên quan</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
            <option value="">Không</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button disabled={create.isPending || name.trim().length < 2} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
          <Plus size={16} /> Thêm thẻ
        </button>
      </form>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
        {isLoading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">Thẻ</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3 text-right">Khóa học</th><th className="px-4 py-3 text-right">Người quan tâm</th>
                <th className="px-4 py-3">Hiển thị</th><th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tags?.map((t) => (
                <tr key={t.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{t.name} <span className="text-xs text-slate-400">({t.slug})</span></td>
                  <td className="px-4 py-3">{TAG_TYPE_LABELS[t.type]}</td>
                  <td className="px-4 py-3">{catName(t.categoryId)}</td>
                  <td className="px-4 py-3 text-right">{t.coursesCount}</td>
                  <td className="px-4 py-3 text-right">{t.usersCount}</td>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={t.isActive} onChange={(e) => update.mutate({ id: t.id, body: { isActive: e.target.checked } })} className="w-4 h-4 accent-indigo-600" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => window.confirm(`Xoá thẻ "${t.name}"? Thẻ sẽ bị gỡ khỏi ${t.coursesCount} khóa học và ${t.usersCount} hồ sơ.`) && remove.mutate(t.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      aria-label="Xoá thẻ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {tags?.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Chưa có thẻ nào. Hãy thêm thẻ đầu tiên.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminTagsPage;

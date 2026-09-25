import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { useTags } from '../../hooks/useTags';
import { TAG_TYPE_LABELS, type Tag } from '../../api/tags';

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max: number;
  /** Danh sách thẻ đã chọn có sẵn (để vẫn hiện tên khi thẻ nằm ngoài kết quả tìm kiếm). */
  selectedTags?: Tag[];
}

/** Chọn nhiều thẻ kỹ năng/chủ đề, có tìm kiếm không dấu và giới hạn số thẻ. */
const TagPicker = ({ selectedIds, onChange, max, selectedTags = [] }: Props) => {
  const [q, setQ] = useState('');
  const { data: tags = [], isLoading } = useTags({ q: q.trim() || undefined, limit: 60 });

  const known = new Map<string, Tag>([...selectedTags, ...tags].map((t) => [t.id, t]));
  const atLimit = selectedIds.length >= max;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else if (!atLimit) onChange([...selectedIds, id]);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm thẻ (ví dụ: python, thiết kế...)"
          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 text-white text-sm"
              title="Bấm để bỏ chọn"
            >
              <Check size={14} /> {known.get(id)?.name ?? '…'}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {isLoading && <span className="text-sm text-slate-400">Đang tải...</span>}
        {!isLoading && tags.length === 0 && <span className="text-sm text-slate-400">Không tìm thấy thẻ phù hợp.</span>}
        {tags
          .filter((t) => !selectedIds.includes(t.id))
          .map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={atLimit}
              onClick={() => toggle(t.id)}
              className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
              title={TAG_TYPE_LABELS[t.type]}
            >
              {t.name}
            </button>
          ))}
      </div>
      <p className="text-xs text-slate-500">
        Đã chọn {selectedIds.length}/{max}
        {atLimit ? ' (đã đủ, bỏ bớt một thẻ để chọn thẻ khác)' : ''}
      </p>
    </div>
  );
};

export default TagPicker;

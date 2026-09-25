import { useState } from 'react';
import { X } from 'lucide-react';
import type { Audience } from '../../api/emailCampaigns';
import { useAdminCourses } from '../../hooks/useAdminCourses';
import { useInstructorCourses } from '../../hooks/useInstructorCourses';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useTags } from '../../hooks/useTags';

const inputCls =
  'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60';

type Option = { value: Audience['type']; label: string };
const ADMIN_OPTIONS: Option[] = [
  { value: 'ALL_USERS', label: 'Tất cả người dùng' },
  { value: 'ROLE', label: 'Theo vai trò (học viên / giảng viên)' },
  { value: 'COURSE_ENROLLEES', label: 'Học viên của một khóa học' },
  { value: 'INTEREST_TAG', label: 'Người quan tâm một chủ đề (chỉ người đã đồng ý cá nhân hoá)' },
  { value: 'SPECIFIC_USERS', label: 'Danh sách người dùng cụ thể (tối đa 50)' },
];
const INSTRUCTOR_OPTIONS: Option[] = [
  { value: 'INSTRUCTOR_STUDENTS', label: 'Tất cả học viên của tôi' },
  { value: 'COURSE_ENROLLEES', label: 'Học viên của một khóa học của tôi' },
];

interface Props {
  role: 'admin' | 'instructor';
  value: Audience;
  onChange: (a: Audience) => void;
  disabled?: boolean;
}

const UserSearch = ({ ids, onChange, disabled }: { ids: string[]; onChange: (ids: string[]) => void; disabled?: boolean }) => {
  const [q, setQ] = useState('');
  const { data } = useAdminUsers({ search: q.trim() || undefined, limit: 8 });
  const users = (data?.data ?? []) as Array<{ id: string; name: string; email: string }>;
  const [names, setNames] = useState<Record<string, string>>({});

  const add = (u: { id: string; name: string; email: string }) => {
    if (ids.includes(u.id) || ids.length >= 50) return;
    setNames({ ...names, [u.id]: `${u.name} (${u.email})` });
    onChange([...ids, u.id]);
  };

  return (
    <div className="space-y-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} disabled={disabled} placeholder="Tìm theo tên hoặc email..." className={inputCls} />
      {q.trim() && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-44 overflow-y-auto">
          {users.length === 0 && <p className="p-3 text-sm text-slate-400">Không tìm thấy.</p>}
          {users.map((u) => (
            <button key={u.id} type="button" disabled={disabled} onClick={() => add(u)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
              {u.name} <span className="text-slate-400">({u.email})</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {ids.map((id) => (
          <span key={id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
            {names[id] ?? id.slice(0, 8)}
            {!disabled && <button type="button" onClick={() => onChange(ids.filter((x) => x !== id))} aria-label="Bỏ"><X size={12} /></button>}
          </span>
        ))}
      </div>
      <p className="text-xs text-slate-500">Đã chọn {ids.length}/50</p>
    </div>
  );
};

/** Chọn đối tượng nhận thư. Giảng viên chỉ thấy các lựa chọn giới hạn ở học viên của mình (server cũng kiểm tra lại). */
const AudiencePicker = ({ role, value, onChange, disabled }: Props) => {
  const admin = role === 'admin';
  const { data: adminCourses } = useAdminCourses(admin ? { limit: 100 } : undefined);
  const { data: instrCourses } = useInstructorCourses(admin ? undefined : { limit: 100 });
  const { data: tags = [] } = useTags({ limit: 200 });
  const courses = (admin ? adminCourses?.data : instrCourses?.data) as Array<{ id: string; title: string }> | undefined;
  const options = admin ? ADMIN_OPTIONS : INSTRUCTOR_OPTIONS;

  const setType = (type: Audience['type']) => {
    switch (type) {
      case 'ROLE': return onChange({ type, role: 'CLIENT' });
      case 'COURSE_ENROLLEES': return onChange({ type, courseId: '' });
      case 'INTEREST_TAG': return onChange({ type, tagId: '' });
      case 'SPECIFIC_USERS': return onChange({ type, userIds: [] });
      default: return onChange({ type } as Audience);
    }
  };

  return (
    <div className="space-y-3">
      <select value={value.type} onChange={(e) => setType(e.target.value as Audience['type'])} disabled={disabled} className={inputCls}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {value.type === 'ROLE' && (
        <select value={value.role} onChange={(e) => onChange({ type: 'ROLE', role: e.target.value as 'CLIENT' | 'INSTRUCTOR' })} disabled={disabled} className={inputCls}>
          <option value="CLIENT">Học viên</option>
          <option value="INSTRUCTOR">Giảng viên</option>
        </select>
      )}
      {value.type === 'COURSE_ENROLLEES' && (
        <select value={value.courseId} onChange={(e) => onChange({ type: 'COURSE_ENROLLEES', courseId: e.target.value })} disabled={disabled} className={inputCls}>
          <option value="">Chọn khóa học</option>
          {(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      )}
      {value.type === 'INTEREST_TAG' && (
        <select value={value.tagId} onChange={(e) => onChange({ type: 'INTEREST_TAG', tagId: e.target.value })} disabled={disabled} className={inputCls}>
          <option value="">Chọn chủ đề / kỹ năng</option>
          {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}
      {value.type === 'SPECIFIC_USERS' && (
        <UserSearch ids={value.userIds} onChange={(userIds) => onChange({ type: 'SPECIFIC_USERS', userIds })} disabled={disabled} />
      )}
    </div>
  );
};

export default AudiencePicker;

import { Link } from 'react-router-dom';
import TagPicker from './TagPicker';
import {
  GOAL_OPTIONS,
  LANGUAGE_OPTIONS,
  LEVEL_OPTIONS,
  OCCUPATION_OPTIONS,
  type LearningProfile,
  type LearningGoal,
  type Level,
  type Occupation,
  type UpdateLearningProfileBody,
} from '../../api/learningProfile';
import type { Tag } from '../../api/tags';

export const MAX_INTERESTS = 10;

/** Bản nháp trong lúc người dùng đang điền (chuỗi rỗng = chưa chọn). */
export type ProfileDraft = {
  goal: LearningGoal | '';
  goalNote: string;
  currentLevel: Level | '';
  occupation: Occupation | '';
  industry: string;
  yearsOfExperience: string;
  weeklyHours: string;
  preferredLanguage: string;
  allowPersonalization: boolean;
  interestIds: string[];
};

export const draftFromProfile = (p?: LearningProfile | null): ProfileDraft => ({
  goal: p?.goal ?? '',
  goalNote: p?.goalNote ?? '',
  currentLevel: p?.currentLevel ?? '',
  occupation: p?.occupation ?? '',
  industry: p?.industry ?? '',
  yearsOfExperience: p?.yearsOfExperience?.toString() ?? '',
  weeklyHours: p?.weeklyHours?.toString() ?? '',
  preferredLanguage: p?.preferredLanguage ?? 'vi',
  allowPersonalization: p?.allowPersonalization ?? false,
  interestIds: p?.interests.map((t) => t.id) ?? [],
});

const num = (s: string) => (s.trim() === '' ? null : Math.max(0, Math.round(Number(s))));

export const bodyFromDraft = (d: ProfileDraft): UpdateLearningProfileBody => ({
  goal: d.goal || null,
  goalNote: d.goalNote.trim() || null,
  currentLevel: d.currentLevel || null,
  occupation: d.occupation || null,
  industry: d.industry.trim() || null,
  yearsOfExperience: num(d.yearsOfExperience),
  weeklyHours: num(d.weeklyHours),
  preferredLanguage: d.preferredLanguage,
  allowPersonalization: d.allowPersonalization,
  interestTagIds: d.interestIds,
});

type FieldProps = { draft: ProfileDraft; onChange: (d: ProfileDraft) => void; knownTags?: Tag[] };

const inputCls =
  'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none';
const labelCls = 'block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5';

export const GoalFields = ({ draft, onChange }: FieldProps) => (
  <div className="space-y-4">
    <div>
      <span className={labelCls}>Bạn học để làm gì?</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOAL_OPTIONS.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => onChange({ ...draft, goal: draft.goal === g.value ? '' : g.value })}
            className={`text-left p-3 rounded-xl border transition-colors ${
              draft.goal === g.value
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
            }`}
          >
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{g.label}</span>
            {g.hint && <span className="block text-xs text-slate-500 mt-0.5">{g.hint}</span>}
          </button>
        ))}
      </div>
    </div>
    <div>
      <label className={labelCls}>
        Mô tả thêm bằng lời của bạn <span className="font-normal text-slate-400">(tuỳ chọn)</span>
      </label>
      <textarea
        value={draft.goalNote}
        onChange={(e) => onChange({ ...draft, goalNote: e.target.value })}
        maxLength={300}
        rows={3}
        placeholder="Ví dụ: Mình là sinh viên năm 3, muốn học làm web để xin thực tập."
        className={inputCls}
      />
      <p className="text-xs text-slate-400 mt-1">{draft.goalNote.length}/300</p>
    </div>
  </div>
);

export const BackgroundFields = ({ draft, onChange }: FieldProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className={labelCls}>Trình độ hiện tại</label>
      <select value={draft.currentLevel} onChange={(e) => onChange({ ...draft, currentLevel: e.target.value as Level | '' })} className={inputCls}>
        <option value="">Chưa chọn</option>
        {LEVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
    <div>
      <label className={labelCls}>Bạn đang là</label>
      <select value={draft.occupation} onChange={(e) => onChange({ ...draft, occupation: e.target.value as Occupation | '' })} className={inputCls}>
        <option value="">Chưa chọn</option>
        {OCCUPATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
    <div>
      <label className={labelCls}>Ngành / lĩnh vực <span className="font-normal text-slate-400">(tuỳ chọn)</span></label>
      <input value={draft.industry} maxLength={100} onChange={(e) => onChange({ ...draft, industry: e.target.value })} placeholder="Ví dụ: Marketing, Kế toán..." className={inputCls} />
    </div>
    <div>
      <label className={labelCls}>Số năm kinh nghiệm <span className="font-normal text-slate-400">(tuỳ chọn)</span></label>
      <input type="number" min={0} max={60} value={draft.yearsOfExperience} onChange={(e) => onChange({ ...draft, yearsOfExperience: e.target.value })} className={inputCls} />
    </div>
  </div>
);

export const InterestFields = ({ draft, onChange, knownTags }: FieldProps) => (
  <div className="space-y-5">
    <div>
      <span className={labelCls}>Bạn quan tâm chủ đề / kỹ năng nào?</span>
      <TagPicker
        selectedIds={draft.interestIds}
        onChange={(ids) => onChange({ ...draft, interestIds: ids })}
        max={MAX_INTERESTS}
        selectedTags={knownTags}
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Thời gian học mỗi tuần (giờ)</label>
        <input type="number" min={0} max={168} value={draft.weeklyHours} onChange={(e) => onChange({ ...draft, weeklyHours: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Ngôn ngữ khóa học ưa thích</label>
        <select value={draft.preferredLanguage} onChange={(e) => onChange({ ...draft, preferredLanguage: e.target.value })} className={inputCls}>
          {LANGUAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  </div>
);

export const ConsentField = ({ draft, onChange }: FieldProps) => (
  <label className="flex gap-3 items-start p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
    <input
      type="checkbox"
      checked={draft.allowPersonalization}
      onChange={(e) => onChange({ ...draft, allowPersonalization: e.target.checked })}
      className="mt-1 w-4 h-4 accent-indigo-600"
    />
    <span className="text-sm text-slate-700 dark:text-slate-300">
      <strong>Cho phép dùng thông tin hồ sơ học tập để gợi ý khóa học phù hợp với tôi.</strong>
      <span className="block text-xs text-slate-500 mt-1">
        Không tick thì bạn vẫn dùng đầy đủ dịch vụ, chỉ không có mục gợi ý. Bạn có thể đổi ý bất cứ lúc nào trong Cài đặt tài khoản.
        Xem thêm <Link to="/privacy" className="text-indigo-600 hover:underline" target="_blank">Chính sách bảo mật</Link>.
      </span>
    </span>
  </label>
);

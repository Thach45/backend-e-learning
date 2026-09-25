import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLearningProfile, useSkipOnboarding, useUpdateLearningProfile } from '../../hooks/useLearningProfile';
import { BackgroundFields, ConsentField, GoalFields, InterestFields, bodyFromDraft, draftFromProfile, type ProfileDraft } from './ProfileFields';

const STEPS = [
  { title: 'Mục tiêu của bạn', hint: 'Giúp chúng tôi hiểu bạn học để làm gì.' },
  { title: 'Bạn đang ở đâu?', hint: 'Trình độ và nền tảng hiện tại của bạn.' },
  { title: 'Bạn quan tâm gì?', hint: 'Chọn tối đa 10 chủ đề, kỹ năng.' },
  { title: 'Gần xong rồi', hint: 'Một lựa chọn về quyền riêng tư.' },
] as const;

/**
 * Màn hướng dẫn sau lần đăng nhập đầu: thu thập hồ sơ học tập (đều tuỳ chọn, có thể bỏ qua).
 * Bỏ qua tối đa 3 lần (đếm ở server), hoàn tất thì không hiện nữa.
 */
const OnboardingWizard = () => {
  const { data: profile } = useLearningProfile();
  const update = useUpdateLearningProfile({ silent: true });
  const skip = useSkipOnboarding();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileDraft>(draftFromProfile(null));
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (profile) setDraft(draftFromProfile(profile));
  }, [profile]);

  if (!profile?.onboarding.shouldPrompt || closed) return null;

  const last = step === STEPS.length - 1;

  const finish = () =>
    update.mutate({ ...bodyFromDraft(draft), completed: true }, { onSuccess: () => setClosed(true) });

  const onSkip = () => {
    setClosed(true); // đóng ngay trong phiên này, server đếm số lần bỏ qua
    skip.mutate();
  };

  return (
    <div className="fixed inset-0 z-[95] bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Hồ sơ học tập">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-indigo-600">Bước {step + 1}/{STEPS.length}</p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{STEPS[step].title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{STEPS[step].hint}</p>
          </div>
          <button onClick={onSkip} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" aria-label="Bỏ qua">
            <X size={20} />
          </button>
        </div>

        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div className="h-1 bg-indigo-600 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 0 && <GoalFields draft={draft} onChange={setDraft} />}
          {step === 1 && <BackgroundFields draft={draft} onChange={setDraft} />}
          {step === 2 && <InterestFields draft={draft} onChange={setDraft} knownTags={profile.interests} />}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tất cả thông tin trên đều tuỳ chọn và bạn có thể sửa lại trong Cài đặt tài khoản.
              </p>
              <ConsentField draft={draft} onChange={setDraft} />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button onClick={onSkip} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">Để sau</button>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Quay lại
              </button>
            )}
            {last ? (
              <button onClick={finish} disabled={update.isPending} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                {update.isPending ? 'Đang lưu...' : 'Hoàn tất'}
              </button>
            ) : (
              <button onClick={() => setStep(step + 1)} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
                Tiếp tục
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;

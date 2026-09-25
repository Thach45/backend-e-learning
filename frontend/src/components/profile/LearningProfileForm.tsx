import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLearningProfile, useUpdateLearningProfile } from '../../hooks/useLearningProfile';
import {
  BackgroundFields,
  ConsentField,
  GoalFields,
  InterestFields,
  bodyFromDraft,
  draftFromProfile,
  type ProfileDraft,
} from './ProfileFields';

/** Biểu mẫu đầy đủ để xem và sửa hồ sơ học tập (dùng trong Cài đặt tài khoản). */
const LearningProfileForm = () => {
  const { data: profile, isLoading } = useLearningProfile();
  const update = useUpdateLearningProfile();
  const [draft, setDraft] = useState<ProfileDraft>(draftFromProfile(null));

  useEffect(() => {
    if (profile) setDraft(draftFromProfile(profile));
  }, [profile]);

  if (isLoading) return <Loader2 className="animate-spin text-indigo-600" />;

  return (
    <div className="space-y-6">
      <GoalFields draft={draft} onChange={setDraft} />
      <BackgroundFields draft={draft} onChange={setDraft} />
      <InterestFields draft={draft} onChange={setDraft} knownTags={profile?.interests} />
      <ConsentField draft={draft} onChange={setDraft} />
      <button
        type="button"
        onClick={() => update.mutate({ ...bodyFromDraft(draft), completed: true })}
        disabled={update.isPending}
        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {update.isPending ? 'Đang lưu...' : 'Lưu hồ sơ học tập'}
      </button>
    </div>
  );
};

export default LearningProfileForm;

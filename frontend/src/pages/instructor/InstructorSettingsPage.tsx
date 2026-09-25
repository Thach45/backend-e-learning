import { useEffect, useState } from 'react';
import { Save, User } from 'lucide-react';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import { useInstructorPublicProfile, useUpdateInstructorProfile } from '../../hooks/useInstructors';

const InstructorSettingsPage = () => {
  const { user } = useAuthStatus();
  const { data: profile, isLoading } = useInstructorPublicProfile(user?.id);
  const updateProfileMutation = useUpdateInstructorProfile();

  const [form, setForm] = useState({
    title: '',
    bio: '',
    expertiseText: '',
    yearsOfExperience: '',
    websiteUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    youtubeUrl: '',
    facebookUrl: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        title: profile.title ?? '',
        bio: profile.bio ?? '',
        expertiseText: profile.expertise.join(', '),
        yearsOfExperience: profile.yearsOfExperience != null ? String(profile.yearsOfExperience) : '',
        websiteUrl: profile.websiteUrl ?? '',
        linkedinUrl: profile.linkedinUrl ?? '',
        githubUrl: profile.githubUrl ?? '',
        youtubeUrl: profile.youtubeUrl ?? '',
        facebookUrl: profile.facebookUrl ?? '',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      title: form.title || undefined,
      bio: form.bio || undefined,
      expertise: form.expertiseText
        ? form.expertiseText.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
      yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
      websiteUrl: form.websiteUrl,
      linkedinUrl: form.linkedinUrl,
      githubUrl: form.githubUrl,
      youtubeUrl: form.youtubeUrl,
      facebookUrl: form.facebookUrl,
    });
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Cài đặt hồ sơ giảng viên</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Thông tin này sẽ hiển thị công khai trên trang giới thiệu giảng viên để học viên tìm hiểu về bạn.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <User size={18} className="text-purple-600" />
            <h2 className="font-bold text-slate-900 dark:text-slate-50">Thông tin công khai</h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Chức danh</label>
            <input
              type="text"
              placeholder="VD: Senior Frontend Engineer"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={150}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Giới thiệu bản thân</label>
            <textarea
              rows={5}
              placeholder="Chia sẻ về kinh nghiệm, hành trình giảng dạy của bạn..."
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              maxLength={2000}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Chuyên môn (cách nhau bởi dấu phẩy)</label>
            <input
              type="text"
              placeholder="React, Node.js, System Design"
              value={form.expertiseText}
              onChange={(e) => setForm((f) => ({ ...f, expertiseText: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Số năm kinh nghiệm</label>
            <input
              type="number"
              min={0}
              max={80}
              value={form.yearsOfExperience}
              onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Website</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.websiteUrl}
                onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">LinkedIn</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={form.linkedinUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">GitHub</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={form.githubUrl}
                onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">YouTube</label>
              <input
                type="url"
                placeholder="https://youtube.com/@..."
                value={form.youtubeUrl}
                onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Facebook</label>
              <input
                type="url"
                placeholder="https://facebook.com/..."
                value={form.facebookUrl}
                onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      )}
    </div>
  );
};

export default InstructorSettingsPage;

import { useEffect, useState } from 'react';
import { User, Lock, Monitor, LogOut, GraduationCap } from 'lucide-react';
import LearningProfileForm from '../components/profile/LearningProfileForm';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { useChangePassword, useUpdateProfile, useMyDevices, useRevokeDevice } from '../hooks/useAuth';

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

const AccountSettingsPage = () => {
  const { user } = useAuthStatus();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const { data: devicesData, isLoading: devicesLoading } = useMyDevices();
  const revokeDeviceMutation = useRevokeDevice();

  const [profileForm, setProfileForm] = useState({ name: '', phoneNumber: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name ?? '', phoneNumber: user.phoneNumber ?? '' });
    }
  }, [user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordForm, {
      onSuccess: () => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Cài đặt tài khoản</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Quản lý thông tin hồ sơ và mật khẩu đăng nhập.</p>
        </div>

        {/* Profile form */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900 dark:text-slate-50">Thông tin cá nhân</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Họ và tên</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                required
                minLength={1}
                maxLength={100}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                minLength={9}
                maxLength={15}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </section>

        {/* Change password form */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900 dark:text-slate-50">Đổi mật khẩu</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                required
                minLength={6}
                maxLength={100}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Mật khẩu mới</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                required
                minLength={6}
                maxLength={100}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, confirmNewPassword: e.target.value }))}
                required
                minLength={6}
                maxLength={100}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </section>

        {/* Devices / login sessions */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Monitor size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900 dark:text-slate-50">Thiết bị đăng nhập</h2>
          </div>

          {devicesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : devicesData?.data && devicesData.data.length > 0 ? (
            <div className="space-y-3">
              {devicesData.data.map((device) => (
                <div
                  key={device.id}
                  className="flex items-start justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{device.userAgent}</p>
                      {device.isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full flex-shrink-0">
                          Thiết bị này
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      IP: {device.ipAddress} · Hoạt động lúc {formatDateTime(device.lastActiveAt)}
                    </p>
                  </div>
                  {!device.isCurrent && (
                    <button
                      onClick={() => revokeDeviceMutation.mutate(device.id)}
                      disabled={revokeDeviceMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      <LogOut size={14} /> Đăng xuất
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Không có thiết bị nào đang hoạt động.</p>
          )}
        </section>

        {/* Hồ sơ học tập */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-1">
            <GraduationCap size={20} className="text-indigo-600" /> Hồ sơ học tập
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Giúp chúng tôi gợi ý khóa học phù hợp với mục tiêu và trình độ của bạn. Tất cả đều tuỳ chọn.</p>
          <LearningProfileForm />
        </section>
      </main>
    </div>
  );
};

export default AccountSettingsPage;

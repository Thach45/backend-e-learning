import { useParams, Link } from 'react-router-dom';
import { Star, Users, BookOpen, Briefcase, Globe, Linkedin, Github, Youtube, Facebook, UserPlus, UserCheck } from 'lucide-react';
import {
  useInstructorPublicProfile,
  useInstructorFollowStatus,
  useFollowInstructor,
  useUnfollowInstructor,
} from '../hooks/useInstructors';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { useSEO } from '../hooks/useSEO';
import { formatVND } from '../utils/format';
import { PLACEHOLDER_IMAGE } from '../utils/placeholder';

const SocialLink = ({ href, icon: Icon, label }: { href?: string | null; icon: typeof Globe; label: string }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
    >
      <Icon size={16} />
    </a>
  );
};

const FollowButton = ({ instructorId }: { instructorId: string }) => {
  const { isAuthenticated } = useAuthStatus();
  const { data: followStatus } = useInstructorFollowStatus(instructorId);
  const followMutation = useFollowInstructor();
  const unfollowMutation = useUnfollowInstructor();

  if (!isAuthenticated) {
    return (
      <Link
        to="/auth/login"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
      >
        <UserPlus size={16} /> Theo dõi
      </Link>
    );
  }

  const isFollowing = followStatus?.following ?? false;
  const isPending = followMutation.isPending || unfollowMutation.isPending;

  return (
    <button
      onClick={() => (isFollowing ? unfollowMutation.mutate(instructorId) : followMutation.mutate(instructorId))}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 ${
        isFollowing
          ? 'bg-white/10 text-white border border-white/40 hover:bg-white/20'
          : 'bg-white text-indigo-700 hover:bg-indigo-50'
      }`}
    >
      {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
      {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
    </button>
  );
};

const InstructorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading, error } = useInstructorPublicProfile(id);

  useSEO({
    title: profile ? `Giảng viên ${profile.name}` : 'Giảng viên',
    description: profile?.bio?.slice(0, 160) || undefined,
    image: profile?.avatar || undefined,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Không tìm thấy giảng viên này.</p>
          <Link to="/courses" className="text-indigo-600 hover:underline">
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-white">
          <img
            src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
            alt={profile.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
            {profile.title && <p className="text-indigo-100 mt-1">{profile.title}</p>}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-indigo-50">
              <span className="flex items-center gap-1.5">
                <Star size={16} className="fill-amber-300 text-amber-300" />
                {profile.averageRating.toFixed(1)} đánh giá
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={16} /> {profile.totalStudents.toLocaleString()} học viên
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={16} /> {profile.totalCourses} khóa học
              </span>
              <span className="flex items-center gap-1.5">{profile.followerCount.toLocaleString()} người theo dõi</span>
            </div>
          </div>
          <div className="sm:ml-auto">
            <FollowButton instructorId={profile.id} />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {profile.bio && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-3">Giới thiệu</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </div>
            )}

            {profile.expertise.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
                  <Briefcase size={16} className="text-indigo-600" /> Chuyên môn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {typeof profile.yearsOfExperience === 'number' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-1">Kinh nghiệm</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{profile.yearsOfExperience} năm trong lĩnh vực</p>
              </div>
            )}

            {(profile.websiteUrl || profile.linkedinUrl || profile.githubUrl || profile.youtubeUrl || profile.facebookUrl) && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-3">Kết nối</h3>
                <div className="flex flex-wrap gap-2">
                  <SocialLink href={profile.websiteUrl} icon={Globe} label="Website" />
                  <SocialLink href={profile.linkedinUrl} icon={Linkedin} label="LinkedIn" />
                  <SocialLink href={profile.githubUrl} icon={Github} label="GitHub" />
                  <SocialLink href={profile.youtubeUrl} icon={Youtube} label="YouTube" />
                  <SocialLink href={profile.facebookUrl} icon={Facebook} label="Facebook" />
                </div>
              </div>
            )}
          </div>

          {/* Courses */}
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Khóa học của {profile.name}</h2>
            {profile.courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {profile.courses.map((course) => {
                  const price = course.salePrice ?? course.price;
                  return (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                      <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={course.thumbnail || PLACEHOLDER_IMAGE}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                          {course.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-indigo-600 font-bold text-sm">{formatVND(price)}</span>
                          {typeof course.totalLearners === 'number' && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <Users size={12} /> {course.totalLearners}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Giảng viên chưa có khóa học nào được xuất bản.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorProfilePage;

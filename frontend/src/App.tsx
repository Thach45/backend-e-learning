import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyCoursesPage from './pages/MyCoursesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminEnrollmentsPage from './pages/admin/AdminEnrollmentsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminPermissionsPage from './pages/admin/AdminPermissionsPage';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCoursesPage from './pages/instructor/InstructorCoursesPage';
import CreateCoursePage from './pages/instructor/CreateCoursePage';
import EditCoursePage from './pages/instructor/EditCoursePage';
import CourseContentPage from './pages/instructor/CourseContentPage';
import InstructorCoursePreviewPage from './pages/instructor/InstructorCoursePreviewPage';
import InstructorCourseInsightsPage from './pages/instructor/InstructorCourseInsightsPage';
import InstructorQuizBuilderPage from './pages/instructor/InstructorQuizBuilderPage';
import InstructorStudentsPage from './pages/instructor/InstructorStudentsPage';
import InstructorReviewsPage from './pages/instructor/InstructorReviewsPage';
import InstructorAnalyticsPage from './pages/instructor/InstructorAnalyticsPage';
import InstructorSettingsPage from './pages/instructor/InstructorSettingsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { navigationUtils } from './utils/navigation';
import './App.css';
import LearningPage from './pages/LearningSection';
import CommunityPage from './pages/Community';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import InstructorProfilePage from './pages/InstructorProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminAuditLogPage from './pages/admin/AdminAuditLogPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminTagsPage from './pages/admin/AdminTagsPage';
import AdminEmailCampaignsPage from './pages/admin/AdminEmailCampaignsPage';
import AdminEmailCampaignEditorPage from './pages/admin/AdminEmailCampaignEditorPage';
import InstructorAnnouncementsPage from './pages/instructor/InstructorAnnouncementsPage';
import InstructorAnnouncementEditorPage from './pages/instructor/InstructorAnnouncementEditorPage';
import UnsubscribePage from './pages/UnsubscribePage';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminTicketPage from './pages/admin/AdminTicketPage';
import AdminFaqPage from './pages/admin/AdminFaqPage';
import AdminSystemPage from './pages/admin/AdminSystemPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminPostEditorPage from './pages/admin/AdminPostEditorPage';
import BlogListPage from './pages/BlogListPage';
import MyCollectionsPage from './pages/MyCollectionsPage';
import PublicProfilePage from './pages/PublicProfilePage';
import PathsListPage from './pages/PathsListPage';
import PathDetailPage from './pages/PathDetailPage';
import AdminPathsPage from './pages/admin/AdminPathsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import ContentPostPage from './pages/ContentPostPage';
import CourseAssignmentsPage from './pages/instructor/CourseAssignmentsPage';
import AssignmentSubmissionsPage from './pages/instructor/AssignmentSubmissionsPage';
import MyAssignmentsPage from './pages/MyAssignmentsPage';
import AssignmentDetailPage from './pages/AssignmentDetailPage';
import HelpCenterPage from './pages/HelpCenterPage';
import MyTicketsPage from './pages/support/MyTicketsPage';
import NewTicketPage from './pages/support/NewTicketPage';
import TicketDetailPage from './pages/support/TicketDetailPage';
import OnboardingWizard from './components/profile/OnboardingWizard';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import MaintenanceLayout from './components/common/MaintenanceLayout';
import { usePublicSiteSettings } from './hooks/useSiteSettings';
import { useAuthStatus } from './hooks/useAuthStatus';

// Component để setup navigation
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: siteSettings, refetch } = usePublicSiteSettings();
  const { hasRole, isAuthenticated } = useAuthStatus();
  // Đặt khi backend vừa trả 503 MAINTENANCE nhưng cấu hình công khai chưa kịp làm mới
  const [forcedMaintenance, setForcedMaintenance] = useState<{ message?: string | null; until?: string | null } | null>(null);

  useEffect(() => {
    navigationUtils.setNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    const onMaintenance = (e: Event) => {
      setForcedMaintenance((e as CustomEvent).detail ?? {});
      void refetch();
    };
    window.addEventListener('maintenance:on', onMaintenance);
    return () => window.removeEventListener('maintenance:on', onMaintenance);
  }, [refetch]);

  useEffect(() => {
    if (siteSettings && !siteSettings.maintenance.enabled) setForcedMaintenance(null);
  }, [siteSettings]);

  // Bảo trì: người dùng thường thấy layout bảo trì thay cho toàn bộ ứng dụng.
  // Admin và các trang đăng nhập (/auth, /google/callback) vẫn vào được để admin tắt bảo trì.
  const maintenanceOn = !!siteSettings?.maintenance.enabled || !!forcedMaintenance;
  const isAdmin = hasRole('ADMIN');
  const isAuthRoute = location.pathname.startsWith('/auth') || location.pathname === '/google/callback';
  if (maintenanceOn && !isAdmin && !isAuthRoute) {
    return (
      <MaintenanceLayout
        message={siteSettings?.maintenance.message ?? forcedMaintenance?.message}
        until={siteSettings?.maintenance.until ?? forcedMaintenance?.until}
        onRetry={() => {
          setForcedMaintenance(null);
          void refetch().then(() => window.location.reload());
        }}
      />
    );
  }

  return (
    <>
    {maintenanceOn && isAdmin && (
      <div className="sticky top-0 z-[90] bg-red-600 text-white text-sm text-center py-1.5 px-4">
        Đang bật chế độ bảo trì: người dùng thường không truy cập được website.{' '}
        <Link to="/admin/settings" className="underline font-semibold">Tắt bảo trì</Link>
      </div>
    )}
    {/* Hướng dẫn hồ sơ học tập cho người dùng đã đăng nhập (không hiện cho admin, trang đăng nhập và trang chính sách) */}
    {isAuthenticated && !isAdmin && !isAuthRoute && !['/privacy', '/terms'].includes(location.pathname) && <OnboardingWizard />}
    <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="unsubscribe" element={<UnsubscribePage />} />
          <Route path="help" element={<HelpCenterPage />} />
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/:slug" element={<ContentPostPage kind="BLOG" />} />
          <Route path="p/:slug" element={<ContentPostPage kind="PAGE" />} />
          <Route path="collections/:id" element={<CollectionDetailPage />} />
          <Route path="u/:userId" element={<PublicProfilePage />} />
          <Route path="paths" element={<PathsListPage />} />
          <Route path="paths/:slug" element={<PathDetailPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="instructors/:id" element={<InstructorProfilePage />} />
          
          {/* Protected routes - require authentication */}
          <Route path="collections" element={<ProtectedRoute><MyCollectionsPage /></ProtectedRoute>} />
          <Route
            path="my-assignments"
            element={
              <ProtectedRoute>
                <MyAssignmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="assignments/:id"
            element={
              <ProtectedRoute>
                <AssignmentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="support/tickets"
            element={
              <ProtectedRoute>
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="support/tickets/new"
            element={
              <ProtectedRoute>
                <NewTicketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="support/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-courses"
            element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="account/orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="account/settings"
            element={
              <ProtectedRoute>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment/:orderId"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="learn/course/:courseId"
            element={
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="learn/course/:courseId/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* Google OAuth callback - route ở root level để match với backend redirect */}
        <Route path="/google/callback" element={<GoogleCallbackPage />} />
        
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        {/* Admin routes - require ADMIN role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="enrollments" element={<AdminEnrollmentsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="documents" element={<AdminDocumentsPage />} />
          <Route path="permissions" element={<AdminPermissionsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogPage />} />
          <Route path="moderation" element={<AdminModerationPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="tags" element={<AdminTagsPage />} />
          <Route path="email-campaigns" element={<AdminEmailCampaignsPage />} />
          <Route path="email-campaigns/:id" element={<AdminEmailCampaignEditorPage />} />
          <Route path="support" element={<AdminSupportPage />} />
          <Route path="support/:id" element={<AdminTicketPage />} />
          <Route path="faq" element={<AdminFaqPage />} />
          <Route path="system" element={<AdminSystemPage />} />
          <Route path="home" element={<AdminHomePage />} />
          <Route path="paths" element={<AdminPathsPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="posts/:id" element={<AdminPostEditorPage />} />
        </Route>
        {/* Instructor routes - require INSTRUCTOR role */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute requiredRoles={['INSTRUCTOR']}>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorDashboard />} />
          <Route path="courses" element={<InstructorCoursesPage />} />
          <Route path="courses/new" element={<CreateCoursePage />} />
          <Route path="courses/:id/edit" element={<EditCoursePage />} />
          <Route path="courses/:id/content" element={<CourseContentPage />} />
          <Route path="courses/:id/preview" element={<InstructorCoursePreviewPage />} />
          <Route path="courses/:id/insights" element={<InstructorCourseInsightsPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="lessons/:lessonId/quiz" element={<InstructorQuizBuilderPage />} />
          <Route path="students" element={<InstructorStudentsPage />} />
          <Route path="reviews" element={<InstructorReviewsPage />} />
          <Route path="analytics" element={<InstructorAnalyticsPage />} />
          <Route path="settings" element={<InstructorSettingsPage />} />
          <Route path="courses/:id/assignments" element={<CourseAssignmentsPage />} />
          <Route path="assignments/:id/submissions" element={<AssignmentSubmissionsPage />} />
          <Route path="announcements" element={<InstructorAnnouncementsPage />} />
          <Route path="announcements/:id" element={<InstructorAnnouncementEditorPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
      <Toaster
        position="top-right"
        closeButton
        richColors
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            boxShadow: '0 10px 30px -12px rgba(15, 23, 42, 0.25)',
            padding: '12px 14px',
            gap: '10px',
          },
          classNames: {
            toast: 'font-medium',
            success: '!border-emerald-200 !bg-emerald-50/80 !text-emerald-700',
            error: '!border-rose-200 !bg-rose-50/85 !text-rose-700',
            warning: '!border-amber-200 !bg-amber-50/85 !text-amber-700',
            info: '!border-slate-200 !bg-slate-50 !text-slate-700',
            default: '!border-slate-200 !bg-slate-50 !text-slate-700',
            closeButton:
              '!border-slate-200 !bg-white !text-slate-500 hover:!bg-slate-50 hover:!text-slate-700',
          },
        }}
      />
    </Router>
  );
};

export default App;

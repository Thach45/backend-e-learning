import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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

// Component để setup navigation
const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigationUtils.setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="instructors/:id" element={<InstructorProfilePage />} />
          
          {/* Protected routes - require authentication */}
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
        </Route>
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
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

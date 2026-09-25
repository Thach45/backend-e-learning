import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/assets/image.png" alt="U Đê Mê" className="w-12 h-12 rounded-xl object-cover shadow-lg shadow-indigo-200" />
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">U Đê Mê</span>
          </Link>
        </div>

        {/* Auth Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; 2025 U Đê Mê. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;


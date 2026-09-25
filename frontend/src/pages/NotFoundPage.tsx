import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
          <Compass size={32} />
        </div>
        <p className="text-5xl font-black text-slate-200 mb-2">404</p>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Không tìm thấy trang</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Trang bạn tìm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

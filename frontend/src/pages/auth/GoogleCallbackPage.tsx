import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { authApi } from '../../api/auth';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const urlError = searchParams.get('error');
  const [error, setError] = useState<string | null>(urlError);
  const hasRun = useRef(false);

  useEffect(() => {
    if (urlError) {
      setTimeout(() => {
        navigate('/auth/login?error=' + encodeURIComponent(urlError));
      }, 3000);
      return;
    }

    if (!code || hasRun.current) return;
    hasRun.current = true;

    authApi
      .exchangeGoogleCode(code)
      .then(({ accessToken, refreshToken }) => {
        localStorage.setItem('accessToken', accessToken);
        Cookies.set('refreshToken', refreshToken, {
          expires: 7, // 7 days
          secure: true,
          sameSite: 'strict',
        });

        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

        setTimeout(() => {
          navigate('/');
        }, 1500);
      })
      .catch(() => {
        setError('Mã đăng nhập đã hết hạn hoặc không hợp lệ');
        setTimeout(() => {
          navigate('/auth/login?error=' + encodeURIComponent('google_exchange_failed'));
        }, 3000);
      });
  }, [code, urlError, navigate, queryClient]);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl inline-flex items-center gap-2 text-rose-700">
          <AlertCircle size={20} />
          <span>Đăng nhập thất bại: {error}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Đang chuyển hướng về trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl inline-flex items-center gap-2 text-emerald-700">
        <CheckCircle size={20} />
        <span>Đăng nhập thành công!</span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">Đang chuyển hướng...</p>
    </div>
  );
};

export default GoogleCallbackPage;

import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';
import { useCategories } from '../../hooks/useCategories';

// Thông tin liên hệ lấy từ biến môi trường lúc build (VITE_CONTACT_*). Chưa cấu hình thì ẩn dòng đó, không hiện dữ liệu mẫu.
const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim();
const CONTACT_PHONE = (import.meta.env.VITE_CONTACT_PHONE as string | undefined)?.trim();
const CONTACT_ADDRESS = (import.meta.env.VITE_CONTACT_ADDRESS as string | undefined)?.trim();

const FooterSection = () => {
  const { data: categories } = useCategories();
  const topCategories = (categories ?? []).slice(0, 6);
  const hasContact = !!(CONTACT_EMAIL || CONTACT_PHONE || CONTACT_ADDRESS);

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="flex items-center gap-2 mb-6">
            <img src="/assets/image.png" alt="U Đê Mê" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-600" />
            <span className="text-xl font-bold text-white tracking-tight">U Đê Mê</span>
          </div>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#9aa6b6' }}>
            Nền tảng học trực tuyến giúp bạn phát triển kỹ năng mỗi ngày cùng các giảng viên tâm huyết.
          </p>
          <SocialLinks />
        </div>

        {topCategories.length > 0 && (
          <div className="footer-section">
            <h4>Khám phá</h4>
            {topCategories.map((c) => (
              <Link key={c.id} to={`/courses?categoryId=${c.id}`}>{c.name}</Link>
            ))}
          </div>
        )}

        <div className="footer-section">
          <h4>Học tập</h4>
          <Link to="/courses">Tất cả khóa học</Link>
          <Link to="/community">Cộng đồng tài liệu</Link>
          <Link to="/leaderboard">Bảng xếp hạng</Link>
        </div>

        <div className="footer-section">
          <h4>Hỗ trợ & Điều khoản</h4>
          <Link to="/help">Trung tâm trợ giúp</Link>
          <Link to="/terms">Điều khoản sử dụng</Link>
          <Link to="/privacy">Chính sách bảo mật</Link>
          {hasContact && (
            <div className="mt-4 flex flex-col gap-3">
              {CONTACT_EMAIL && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-indigo-400" />
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </div>
              )}
              {CONTACT_PHONE && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-indigo-400" />
                  <a href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}>{CONTACT_PHONE}</a>
                </div>
              )}
              {CONTACT_ADDRESS && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-indigo-400" />
                  <span>{CONTACT_ADDRESS}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} U Đê Mê. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">Điều khoản</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

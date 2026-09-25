import { Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const FooterSection = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="flex items-center gap-2 mb-6">
            <img src="/assets/image.png" alt="U Đê Mê" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-600" />
            <span className="text-xl font-bold text-white tracking-tight">U Đê Mê</span>
          </div>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#9aa6b6' }}>
            Nền tảng học trực tuyến hàng đầu với hơn 5000+ khóa học từ các chuyên gia hàng đầu. Phát triển kỹ năng của bạn ngay hôm nay.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Youtube size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Khám phá</h4>
          <Link to="/courses?category=programming">Lập trình & IT</Link>
          <Link to="/courses?category=design">Thiết kế đồ họa</Link>
          <Link to="/courses?category=marketing">Marketing & Sales</Link>
          <Link to="/courses?category=business">Kinh doanh & Khởi nghiệp</Link>
          <Link to="/courses?category=language">Ngoại ngữ</Link>
          <Link to="/courses?category=personal-development">Phát triển bản thân</Link>
        </div>

        <div className="footer-section">
          <h4>Về chúng tôi</h4>
          <Link to="/about">Giới thiệu về U Đê Mê</Link>
          <Link to="/careers">Tuyển dụng</Link>
          <Link to="/blog">Blog kỹ năng</Link>
          <Link to="/partners">Đối tác & Liên kết</Link>
          <Link to="/press">Báo chí & Truyền thông</Link>
        </div>

        <div className="footer-section">
          <h4>Hỗ trợ & Liên hệ</h4>
          <Link to="/help">Trung tâm trợ giúp</Link>
          <Link to="/terms">Điều khoản sử dụng</Link>
          <Link to="/privacy">Chính sách bảo mật</Link>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-indigo-400" />
              <span>support@learnhub.edu.vn</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-indigo-400" />
              <span>1900 123 456</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-indigo-400" />
              <span>Q. Cầu Giấy, Hà Nội</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} U Đê Mê. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-white transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;


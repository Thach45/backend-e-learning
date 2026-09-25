import { Mail, ArrowRight } from 'lucide-react';

const NewsletterSection = () => {
  return (
    <section className="pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left: Content */}
          <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-xs font-bold mb-8">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                Bản tin hàng tuần
              </div>
              
              <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-slate-50 mb-6 leading-tight">
                Kiến thức mới <br />
                Mở ra cơ hội mới
              </h2>
              
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed">
                Đăng ký ngay để nhận những bài viết chuyên sâu về AI, Công nghệ và Lộ trình nghề nghiệp từ chuyên gia.
              </p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="email"
                    placeholder="Địa chỉ email của bạn"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
                
                <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-indigo-200">
                  <span>Đăng ký nhận bản tin</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-8 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                  ))}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Tham gia cùng <span className="text-slate-900 dark:text-slate-50 font-bold">50,000+</span> học viên khác
                </p>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center border-l border-slate-100 dark:border-slate-800">
            <img 
              src="/assets/newsletter-viz-2.png" 
              alt="Luxury Abstract Sculpture" 
              className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100"
            />
            <div className="absolute inset-0 bg-indigo-600/5 mix-blend-multiply"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;


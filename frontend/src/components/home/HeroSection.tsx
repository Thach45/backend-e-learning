import { ArrowRight, Play, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative py-8 md:py-6 overflow-hidden">
      <div className="container mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ">
          {/* Left Content */}
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-sm font-semibold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
              Nền tảng học tập thế hệ mới
            </div>
            
            <h1 className="text-4xl md:text-6xl font-semibold text-slate-900 dark:text-slate-50 leading-[1.1] mb-6 tracking-tight">
              Khai phóng tiềm năng <br />
              với <span className="text-indigo-600">Kiến thức thực chiến</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-xl">
              Tham gia cùng hơn 15.000 học viên đang chinh phục những kỹ năng mới mỗi ngày. 
              Học từ các chuyên gia hàng đầu và xây dựng sự nghiệp mơ ước.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/courses')} 
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                Bắt đầu học ngay <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950 transition-all flex items-center justify-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <Play size={14} fill="currentColor" />
                </div>
                Xem video giới thiệu
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    alt="User"
                  />
                ))}
                <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  +15k
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <span className="text-slate-900 dark:text-slate-50 font-bold">4.9/5.0</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đánh giá từ cộng đồng</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10"></div>
            
            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white/50 aspect-square md:aspect-auto md:h-[500px]">
              <img
                src="/assets/hero-student.png"
                alt="Student Learning"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating UI Elements */}
            <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 animate-bounce-slow z-20 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học viên mới</p>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">+2.5k tuần này</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-20 hidden md:block max-w-[240px]">
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Tiến độ học tập</p>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-indigo-600 rounded-full"></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span>UI/UX Design</span>
                  <span>75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


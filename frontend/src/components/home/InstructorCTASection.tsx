import { Users } from 'lucide-react';

const InstructorCTASection = () => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
            <Users size={28} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Trở thành Giảng viên</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
            Chia sẻ kiến thức của bạn với hàng triệu học viên trên toàn thế giới. Chúng tôi cung cấp công cụ và kỹ năng để bạn dạy những gì bạn yêu thích.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
              Bắt đầu dạy học
            </button>
            <button className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
        <div className="md:w-1/2 bg-slate-100 dark:bg-slate-800 relative min-h-[300px]">
          <img
            src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Instructor"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10"></div>
        </div>
      </div>
    </section>
  );
};

export default InstructorCTASection;


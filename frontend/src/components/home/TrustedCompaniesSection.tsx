const TrustedCompaniesSection = () => {
  return (
    <section className="text-center py-4 border-b border-slate-200 dark:border-slate-800/60 pb-12">
      <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
        Được tin dùng bởi hơn 4,000 công ty hàng đầu
      </p>
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <span className="text-2xl font-bold font-serif text-slate-800 dark:text-slate-100 italic">Google</span>
        <span className="text-2xl font-bold font-sans tracking-tighter text-slate-800 dark:text-slate-100">Netflix</span>
        <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">Airbnb</span>
        <span className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100">Amazon</span>
        <span className="text-2xl font-bold font-serif text-slate-800 dark:text-slate-100">Meta</span>
      </div>
    </section>
  );
};

export default TrustedCompaniesSection;


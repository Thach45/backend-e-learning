import SimpleMarkdown from './SimpleMarkdown';
import { useSEO } from '../../hooks/useSEO';

/** Trang nội dung pháp lý. Còn chỗ trống `[[...]]` thì báo rõ là đang hoàn thiện và tô vàng các chỗ đó. */
const LegalPage = ({ title, source }: { title: string; source: string }) => {
  useSEO({ title });
  const incomplete = source.includes('[[');
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-slate-700 dark:text-slate-300">
      {incomplete && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
          Nội dung này đang được hoàn thiện. Các mục tô vàng sẽ được bổ sung thông tin chính thức.
        </div>
      )}
      <SimpleMarkdown source={source} highlightPlaceholders={incomplete} />
    </div>
  );
};

export default LegalPage;

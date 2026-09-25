type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
};

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  if (!items.length) return null;

  return (
    <nav className="text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <a href={item.href} className="font-semibold text-indigo-600 hover:text-indigo-700">
                  {item.label}
                </a>
              ) : (
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
              )}
              {!isLast && <span className="text-slate-300">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export type { Crumb, BreadcrumbsProps };
export default Breadcrumbs;


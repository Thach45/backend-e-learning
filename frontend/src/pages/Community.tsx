import { useState } from 'react';
import { 
  Search, 
  UploadCloud, 
  FileText, 
  Download, 
  Filter, 
  School, 
  Book, 
  TrendingUp, 
  Award,
  Loader2,
  Heart
} from 'lucide-react';
import { useDocuments, useTopContributors, useToggleLike, useTrackDownload } from '../hooks/useDocuments';
import { useDocumentCategories } from '../hooks/useDocumentCategories';
import type { Document, DocumentSort } from '../api/documents';
import { useAuthStatus } from '../hooks/useAuthStatus';
import UploadDocumentModal from '../components/community/UploadDocumentModal';
import { toast } from 'sonner';

// --- COMPONENTS ---

const DocumentCard = ({ 
  doc, 
  onLike, 
  onDownload,
  isAuthenticated 
}: { 
  doc: Document; 
  onLike: (id: string) => void;
  onDownload: (id: string, url: string) => void;
  isAuthenticated: boolean;
}) => {
  const defaultThumbnail = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  
  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      {/* Thumbnail Preview Area */}
      <div className="relative h-40 bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <img 
          src={doc.thumbnail || defaultThumbnail} 
          alt={doc.title} 
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Document Type Badge */}
        <div className="absolute top-3 right-3 bg-white dark:bg-slate-900 shadow-sm px-2 py-1 rounded text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
          {doc.type}
        </div>

        {/* Verification Badge */}
        {doc.isVerified && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1">
            <Award size={12} /> Uy tín
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Meta Info */}
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
            {doc.university || 'Chưa phân loại'}
          </span>
          {doc.subject && (
            <>
              <span>•</span>
              <span className="truncate">{doc.subject}</span>
            </>
          )}
        </div>

        <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {doc.title}
        </h3>

        {/* Uploader */}
        {doc.uploader && (
          <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
            <img 
              src={doc.uploader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.uploader.name)}&background=random`}
              alt={doc.uploader.name}
              className="w-5 h-5 rounded-full"
            />
            <span>{doc.uploader.name}</span>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onDownload(doc.id, doc.url); }}
              className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <Download size={14} /> {formatNumber(doc.downloads)}
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!isAuthenticated) {
                  toast.error('Vui lòng đăng nhập để thích tài liệu');
                  return;
                }
                onLike(doc.id); 
              }}
              className={`flex items-center gap-1 transition-colors ${doc.isLiked ? 'text-rose-500' : 'hover:text-rose-500'}`}
            >
              <Heart size={14} fill={doc.isLiked ? 'currentColor' : 'none'} /> {formatNumber(doc.likes)}
            </button>
          </div>
          {doc.pages && <span>{doc.pages} trang</span>}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

const CommunityPage = () => {
  const { isAuthenticated } = useAuthStatus();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<DocumentSort>('newest');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [page, setPage] = useState(1);

  // Queries
  const { data: documentsData, isLoading: isLoadingDocuments } = useDocuments({
    page,
    limit: 12,
    sort: selectedSort,
    search: searchQuery || undefined,
    categoryId: selectedCategoryId || undefined,
    university: selectedUniversity || undefined,
  });

  const { data: categoriesData } = useDocumentCategories({ isActive: true });
  const { data: contributorsData } = useTopContributors(5);

  // Mutations
  const toggleLikeMutation = useToggleLike();
  const trackDownloadMutation = useTrackDownload();

  const handleLike = (id: string) => {
    toggleLikeMutation.mutate(id);
  };

  const handleDownload = (id: string, url: string) => {
    trackDownloadMutation.mutate(id, {
      onSuccess: (data) => {
        // Open download URL in new tab
        window.open(data.url, '_blank');
      },
      onError: () => {
        // Fallback: just open the URL
        window.open(url, '_blank');
      },
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const documents = documentsData?.data || [];
  const categories = categoriesData?.data || [];
  const contributors = contributorsData?.data || [];
  const totalPages = documentsData?.totalPages || 1;

 

  const TRENDING_TAGS = ['Tiểu luận', 'Đề thi cuối kỳ', 'Slide', 'Giáo trình', 'Báo cáo thực tập', 'Toeic', 'IELTS'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      
     
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: FILTERS & NAV */}
          <aside className="lg:col-span-3 space-y-6">
            

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                <Book size={18} className="text-indigo-600"/> Lĩnh vực
              </h3>
              <div className="space-y-1">
                {categories.length > 0 ? categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { 
                      setSelectedCategoryId(selectedCategoryId === cat.id ? '' : cat.id);
                      setPage(1);
                    }}
                    className={`w-full flex justify-between items-center p-2 rounded-lg transition-colors ${
                      selectedCategoryId === cat.id 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'hover:bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-sm">{cat.name}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {cat.documentCount || 0}
                    </span>
                  </button>
                )) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">Chưa có danh mục</p>
                )}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT: DOCUMENT GRID */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Filter Tabs */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
              <div className="flex gap-1">
                {([
                  { value: 'newest' as const, label: 'Mới nhất' },
                  { value: 'trending' as const, label: 'Xu hướng' },
                  { value: 'most_viewed' as const, label: 'Được xem nhiều' },
                  { value: 'most_liked' as const, label: 'Được thích nhất' },
                ]).map((sortOption) => (
                  <button
                    key={sortOption.value}
                    onClick={() => { setSelectedSort(sortOption.value); setPage(1); }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                      selectedSort === sortOption.value 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950'
                    }`}
                  >
                    {sortOption.label}
                  </button>
                ))}
              </div>
              <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 hidden sm:block">
                <Filter size={18}/>
              </button>
            </div>

            {/* Loading State */}
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
              </div>
            ) : documents.length > 0 ? (
              <>
                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map(doc => (
                    <DocumentCard 
                      key={doc.id} 
                      doc={doc} 
                      onLike={handleLike}
                      onDownload={handleDownload}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:bg-slate-950"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 dark:bg-slate-950"
                    >
                      Tiếp
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Chưa có tài liệu nào</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Hãy là người đầu tiên chia sẻ tài liệu!</p>
                {isAuthenticated && (
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
                  >
                    Đăng tài liệu
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: LEADERBOARD & CTA */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Upload CTA */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-50 text-indigo-600">
                <UploadCloud size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 mb-2">Chia sẻ tài liệu</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 px-2">Đăng tài liệu để giúp đỡ cộng đồng.</p>
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Vui lòng đăng nhập để đăng tài liệu');
                    return;
                  }
                  setIsUploadModalOpen(true);
                }}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Upload ngay
              </button>
            </div>

            {/* Top Contributors */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500"/> Top đóng góp
                </h3>
                <span className="text-xs text-slate-400 dark:text-slate-500">Tất cả</span>
              </div>
              
              <div className="space-y-4">
                {contributors.length > 0 ? contributors.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="relative font-bold text-slate-300 w-4 text-center text-sm">{index + 1}</div>
                    <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">{user.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.university || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {user.uploads}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Chưa có người đóng góp</p>
                )}
              </div>
            </div>

            {/* Trending Keywords */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4 text-sm">Từ khóa nổi bật</h3>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); setPage(1); }}
                    className="px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-200 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadDocumentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
};

export default CommunityPage;

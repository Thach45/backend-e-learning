import { useState } from 'react';
import { 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText, 
  Download,
  Heart,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Award,
  Plus,
  Edit2,
  FolderOpen,
  Tag
} from 'lucide-react';
import { useDocuments, useToggleVerified, useAdminDeleteDocument } from '../../hooks/useDocuments';
import { 
  useDocumentCategories, 
  useCreateDocumentCategory, 
  useUpdateDocumentCategory, 
  useDeleteDocumentCategory 
} from '../../hooks/useDocumentCategories';
import {
  useDocumentTags,
  useCreateDocumentTag,
  useUpdateDocumentTag,
  useDeleteDocumentTag
} from '../../hooks/useDocumentTags';
import type { Document, DocumentSort } from '../../api/documents';
import type { DocumentCategory } from '../../api/documentCategories';
import type { DocumentTag } from '../../api/documentTags';
import { toast } from 'sonner';

const UNIVERSITIES = [
  'ĐH Bách Khoa Hà Nội',
  'ĐH Kinh Tế Quốc Dân',
  'ĐH Ngoại Thương',
  'ĐH Quốc Gia Hà Nội',
  'ĐH FPT',
  'Học viện Ngân Hàng',
  'ĐH Công Nghệ - ĐHQGHN',
  'ĐH Xây Dựng',
  'ĐH Giao Thông Vận Tải',
  'ĐH Thương Mại',
  'ĐH Bách Khoa TP.HCM',
  'ĐH Quốc Gia TP.HCM',
  'ĐH Kinh Tế TP.HCM',
];

type TabType = 'documents' | 'categories' | 'tags';

const AdminDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('documents');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý tài liệu</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Quản lý tài liệu và lĩnh vực trong cộng đồng
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'documents'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950'
          }`}
        >
          <FileText size={16} className="inline mr-2" />
          Tài liệu
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'categories'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950'
          }`}
        >
          <FolderOpen size={16} className="inline mr-2" />
          Lĩnh vực
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'tags'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950'
          }`}
        >
          <Tag size={16} className="inline mr-2" />
          Từ khóa
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'documents' && <DocumentsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'tags' && <TagsTab />}
    </div>
  );
};

// ============= DOCUMENTS TAB =============
const DocumentsTab = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedSort, setSelectedSort] = useState<DocumentSort>('newest');
  const [selectedVerified, setSelectedVerified] = useState<string>('ALL');
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  const { data: documentsData, isLoading } = useDocuments({
    page,
    limit,
    search: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
    university: selectedUniversity || undefined,
    sort: selectedSort,
  });

  const { data: categoriesData } = useDocumentCategories({ isActive: true });
  const toggleVerifyMutation = useToggleVerified();
  const deleteDocumentMutation = useAdminDeleteDocument();

  const documents = documentsData?.data || [];
  const totalPages = documentsData?.totalPages || 1;
  const totalItems = documentsData?.totalItems || 0;
  const categories = categoriesData?.data || [];

  const filteredDocuments = selectedVerified === 'ALL' 
    ? documents 
    : documents.filter(doc => 
        selectedVerified === 'VERIFIED' ? doc.isVerified : !doc.isVerified
      );

  const handleToggleVerify = (id: string, currentStatus: boolean) => {
    toggleVerifyMutation.mutate({ id, isVerified: !currentStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      deleteDocumentMutation.mutate(id);
    }
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, { color: string }> = {
      PDF: { color: 'bg-rose-50 text-rose-700' },
      DOC: { color: 'bg-blue-50 text-blue-700' },
      PPT: { color: 'bg-orange-50 text-orange-700' },
      ZIP: { color: 'bg-purple-50 text-purple-700' },
    };
    return map[type] || { color: 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
          >
            <option value="">Tất cả lĩnh vực</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={selectedUniversity}
            onChange={(e) => { setSelectedUniversity(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
          >
            <option value="">Tất cả trường</option>
            {UNIVERSITIES.map((uni) => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
          <select
            value={selectedVerified}
            onChange={(e) => { setSelectedVerified(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="VERIFIED">Đã xác nhận</option>
            <option value="UNVERIFIED">Chưa xác nhận</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-300">Sắp xếp:</span>
          {([
            { value: 'newest', label: 'Mới nhất' },
            { value: 'most_viewed', label: 'Xem nhiều' },
            { value: 'most_liked', label: 'Thích nhiều' },
            { value: 'most_downloaded', label: 'Tải nhiều' },
          ] as const).map((sortOption) => (
            <button
              key={sortOption.value}
              onClick={() => { setSelectedSort(sortOption.value); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedSort === sortOption.value
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950'
              }`}
            >
              {sortOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy tài liệu nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="text-left p-4 font-semibold">Tài liệu</th>
                    <th className="text-left p-4 font-semibold">Người đăng</th>
                    <th className="text-left p-4 font-semibold">Lĩnh vực</th>
                    <th className="text-center p-4 font-semibold">Thống kê</th>
                    <th className="text-center p-4 font-semibold">Xác nhận</th>
                    <th className="text-left p-4 font-semibold">Ngày đăng</th>
                    <th className="text-right p-4 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <FileText className="text-slate-500 dark:text-slate-400" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-900 dark:text-slate-50 truncate max-w-[200px]">{doc.title}</h4>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(doc.type).color}`}>
                                {doc.type}
                              </span>
                            </div>
                            {doc.university && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{doc.university}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {doc.uploader ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={doc.uploader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.uploader.name)}&background=random`}
                              alt={doc.uploader.name}
                              className="w-7 h-7 rounded-full"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-200 truncate max-w-[100px]">{doc.uploader.name}</span>
                          </div>
                        ) : <span className="text-slate-400 dark:text-slate-500">-</span>}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600 dark:text-slate-300">{doc.category?.name || '-'}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><Eye size={14} /> {doc.views}</span>
                          <span className="flex items-center gap-1"><Heart size={14} /> {doc.likes}</span>
                          <span className="flex items-center gap-1"><Download size={14} /> {doc.downloads}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {doc.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                            <Award size={12} /> Đã xác nhận
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
                            Chưa xác nhận
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600 dark:text-slate-300">{formatDate(doc.uploadedAt)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewingDocument(doc)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Xem chi tiết">
                            <Eye size={18} />
                          </button>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Mở file">
                            <ExternalLink size={18} />
                          </a>
                          <button
                            onClick={() => handleToggleVerify(doc.id, doc.isVerified)}
                            disabled={toggleVerifyMutation.isPending}
                            className={`p-2 rounded-lg ${doc.isVerified ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title={doc.isVerified ? 'Gỡ xác nhận' : 'Xác nhận'}
                          >
                            {doc.isVerified ? <XCircle size={18} /> : <CheckCircle size={18} />}
                          </button>
                          <button onClick={() => handleDelete(doc.id)} disabled={deleteDocumentMutation.isPending} className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Xóa">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Trang {page} / {totalPages} (Tổng: {totalItems} tài liệu)</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isLoading} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm flex items-center gap-1 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50">
                    <ChevronLeft size={16} /> Trước
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm flex items-center gap-1 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50">
                    Tiếp <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {viewingDocument && (
        <DocumentDetailModal
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
          onToggleVerify={handleToggleVerify}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

// ============= CATEGORIES TAB =============
const CategoriesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);

  const { data: categoriesData, isLoading } = useDocumentCategories();
  const createMutation = useCreateDocumentCategory();
  const updateMutation = useUpdateDocumentCategory();
  const deleteMutation = useDeleteDocumentCategory();

  const categories = categoriesData?.data || [];
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => { setEditingCategory(null); setIsModalOpen(true); };
  const handleEdit = (category: DocumentCategory) => { setEditingCategory(category); setIsModalOpen(true); };
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };
  const handleToggleActive = (category: DocumentCategory) => {
    updateMutation.mutate({ id: category.id, body: { isActive: !category.isActive } });
  };

  return (
    <>
      {/* Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm lĩnh vực..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
          />
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Thêm lĩnh vực
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có lĩnh vực nào</p>
            <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">
              Thêm lĩnh vực đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className={`p-5 border rounded-xl transition-all ${
                  category.isActive 
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 hover:shadow-md' 
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      category.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {category.icon || '📁'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50">{category.name}</h3>
                      {category.slug && <p className="text-xs text-slate-400 dark:text-slate-500">/{category.slug}</p>}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {category.isActive ? 'Hoạt động' : 'Ẩn'}
                  </span>
                </div>

                {category.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{category.description}</p>}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{category.documentCount || 0} tài liệu</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(category)}
                      disabled={updateMutation.isPending}
                      className={`p-2 rounded-lg transition-colors ${category.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      title={category.isActive ? 'Ẩn' : 'Hiện'}
                    >
                      {category.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    </button>
                    <button onClick={() => handleEdit(category)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Sửa">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(category.id, category.name)} disabled={deleteMutation.isPending} className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            if (editingCategory) {
              updateMutation.mutate({ id: editingCategory.id, body: data }, { onSuccess: () => setIsModalOpen(false) });
            } else {
              createMutation.mutate(data, { onSuccess: () => setIsModalOpen(false) });
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </>
  );
};

// ============= TAGS TAB =============
const TagsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<DocumentTag | null>(null);

  const { data: tagsData, isLoading } = useDocumentTags();
  const createMutation = useCreateDocumentTag();
  const updateMutation = useUpdateDocumentTag();
  const deleteMutation = useDeleteDocumentTag();

  const tags = tagsData?.data || [];
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => { setEditingTag(null); setIsModalOpen(true); };
  const handleEdit = (tag: DocumentTag) => { setEditingTag(tag); setIsModalOpen(true); };
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa từ khóa "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };
  const handleToggleActive = (tag: DocumentTag) => {
    updateMutation.mutate({ id: tag.id, body: { isActive: !tag.isActive } });
  };

  return (
    <>
      {/* Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm từ khóa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
          />
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Thêm từ khóa
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có từ khóa nào</p>
            <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">
              Thêm từ khóa đầu tiên
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 p-6">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className={`group relative px-4 py-2.5 rounded-xl border transition-all ${
                  tag.isActive 
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 hover:shadow-md' 
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tag.color && (
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  <span className="font-medium text-slate-800 dark:text-slate-100">{tag.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">({tag.documentCount || 0})</span>
                </div>
                
                {/* Hover actions */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(tag)}
                    disabled={updateMutation.isPending}
                    className={`p-1.5 rounded-lg shadow-md transition-colors ${
                      tag.isActive 
                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                    title={tag.isActive ? 'Ẩn' : 'Hiện'}
                  >
                    {tag.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  </button>
                  <button 
                    onClick={() => handleEdit(tag)} 
                    className="p-1.5 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600" 
                    title="Sửa"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(tag.id, tag.name)} 
                    disabled={deleteMutation.isPending} 
                    className="p-1.5 bg-rose-500 text-white rounded-lg shadow-md hover:bg-rose-600" 
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <TagFormModal
          tag={editingTag}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            if (editingTag) {
              updateMutation.mutate({ id: editingTag.id, body: data }, { onSuccess: () => setIsModalOpen(false) });
            } else {
              createMutation.mutate(data, { onSuccess: () => setIsModalOpen(false) });
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </>
  );
};

// ============= MODALS =============

const DocumentDetailModal = ({
  document,
  onClose,
  onToggleVerify,
  onDelete,
}: {
  document: Document;
  onClose: () => void;
  onToggleVerify: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
          {document.thumbnail && (
            <img src={document.thumbnail} alt={document.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-white dark:bg-slate-900/20 backdrop-blur rounded text-xs font-bold text-white uppercase">{document.type}</span>
              {document.isVerified && (
                <span className="px-2 py-1 bg-emerald-500 rounded text-xs font-bold text-white flex items-center gap-1">
                  <Award size={12} /> Uy tín
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">{document.title}</h2>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-900/20 backdrop-blur rounded-lg text-white hover:bg-white dark:bg-slate-900/30">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Eye size={18} /><span><strong>{document.views}</strong> lượt xem</span></div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Heart size={18} /><span><strong>{document.likes}</strong> lượt thích</span></div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Download size={18} /><span><strong>{document.downloads}</strong> lượt tải</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Người đăng</p>
              <div className="flex items-center gap-2 mt-1">
                {document.uploader ? (
                  <>
                    <img src={document.uploader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(document.uploader.name)}&background=random`} alt={document.uploader.name} className="w-6 h-6 rounded-full" />
                    <span className="font-medium text-slate-800 dark:text-slate-100">{document.uploader.name}</span>
                  </>
                ) : <span className="text-slate-400 dark:text-slate-500">Không rõ</span>}
              </div>
            </div>
            <div><p className="text-sm text-slate-500 dark:text-slate-400">Lĩnh vực</p><p className="font-medium text-slate-800 dark:text-slate-100 mt-1">{document.category?.name || '-'}</p></div>
            <div><p className="text-sm text-slate-500 dark:text-slate-400">Trường đại học</p><p className="font-medium text-slate-800 dark:text-slate-100 mt-1">{document.university || '-'}</p></div>
            <div><p className="text-sm text-slate-500 dark:text-slate-400">Môn học</p><p className="font-medium text-slate-800 dark:text-slate-100 mt-1">{document.subject || '-'}</p></div>
            <div><p className="text-sm text-slate-500 dark:text-slate-400">Số trang</p><p className="font-medium text-slate-800 dark:text-slate-100 mt-1">{document.pages || '-'}</p></div>
            <div><p className="text-sm text-slate-500 dark:text-slate-400">Ngày đăng</p><p className="font-medium text-slate-800 dark:text-slate-100 mt-1">{new Date(document.uploadedAt).toLocaleDateString('vi-VN')}</p></div>
          </div>

          {document.tags && document.tags.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Từ khóa</p>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <span 
                    key={tag.id} 
                    className="px-3 py-1 rounded-lg text-sm font-medium"
                    style={{ 
                      backgroundColor: tag.color ? `${tag.color}20` : '#f1f5f9',
                      color: tag.color || '#475569'
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <a href={document.url} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 text-center flex items-center justify-center gap-2">
              <ExternalLink size={18} /> Mở file
            </a>
            <button
              onClick={() => onToggleVerify(document.id, document.isVerified)}
              className={`px-4 py-2.5 font-semibold rounded-xl flex items-center gap-2 ${document.isVerified ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
            >
              {document.isVerified ? <><XCircle size={18} /> Gỡ xác nhận</> : <><CheckCircle size={18} /> Xác nhận</>}
            </button>
            <button onClick={() => { onDelete(document.id); onClose(); }} className="px-4 py-2.5 bg-rose-50 text-rose-700 font-semibold rounded-xl hover:bg-rose-100 flex items-center gap-2">
              <Trash2 size={18} /> Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryFormModal = ({
  category,
  onClose,
  onSubmit,
  isLoading,
}: {
  category: DocumentCategory | null;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; slug?: string; icon?: string; isActive?: boolean }) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    slug: category?.slug || '',
    icon: category?.icon || '',
    isActive: category?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Vui lòng nhập tên lĩnh vực'); return; }
    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      slug: formData.slug.trim() || undefined,
      icon: formData.icon.trim() || undefined,
      isActive: formData.isActive,
    });
  };

  const generateSlug = () => {
    const slug = formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const ICON_OPTIONS = ['📁', '📚', '💻', '📊', '🔬', '🎨', '🏛️', '⚖️', '💼', '🏥', '🔧', '📐', '🌐', '📝', '🎓'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{category ? 'Sửa lĩnh vực' : 'Thêm lĩnh vực mới'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Tên lĩnh vực <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Công nghệ thông tin"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Slug (URL)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="cong-nghe-thong-tin"
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={generateSlug} className="px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950">Tự động</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về lĩnh vực..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${formData.icon === icon ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="w-5 h-5 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Hiển thị lĩnh vực này</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:bg-slate-950">Hủy</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {isLoading && <Loader2 className="animate-spin" size={18} />}
              {category ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TagFormModal = ({
  tag,
  onClose,
  onSubmit,
  isLoading,
}: {
  tag: DocumentTag | null;
  onClose: () => void;
  onSubmit: (data: { name: string; slug?: string; description?: string; color?: string; isActive?: boolean; sortOrder?: number }) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: tag?.name || '',
    slug: tag?.slug || '',
    description: tag?.description || '',
    color: tag?.color || '',
    isActive: tag?.isActive ?? true,
    sortOrder: tag?.sortOrder ?? 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Vui lòng nhập tên từ khóa'); return; }
    onSubmit({
      name: formData.name.trim(),
      slug: formData.slug.trim() || undefined,
      description: formData.description.trim() || undefined,
      color: formData.color.trim() || undefined,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
    });
  };

  const generateSlug = () => {
    const slug = formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const COLOR_OPTIONS = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', 
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', 
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', 
    '#EC4899', '#F43F5E',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{tag ? 'Sửa từ khóa' : 'Thêm từ khóa mới'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Tên từ khóa <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Đề thi"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Slug (URL)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="de-thi"
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={generateSlug} className="px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950">Tự động</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Mô tả</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color: '' }))}
                className={`w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 ${!formData.color ? 'ring-2 ring-indigo-500 ring-offset-2' : 'border-slate-300 dark:border-slate-700'}`}
              >
                ✕
              </button>
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Thứ tự hiển thị</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              className="w-24 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="w-5 h-5 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Hiển thị từ khóa này</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:bg-slate-950">Hủy</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {isLoading && <Loader2 className="animate-spin" size={18} />}
              {tag ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDocumentsPage;

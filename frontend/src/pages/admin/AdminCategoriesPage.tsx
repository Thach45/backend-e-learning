import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, FolderTree, X, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAdminCategories, useCreateAdminCategory, useUpdateAdminCategory, useAdminCategory } from '../../hooks/useAdminCategories';
import ImageUpload from '../../components/common/ImageUpload';
import type { AdminCategory, CreateCategoryBody, UpdateCategoryBody } from '../../api/admin';

const AdminCategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const { data: categories, isLoading, error } = useAdminCategories();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const getParentName = (parentId: string | null) => {
    if (!parentId || !categories) return null;
    return categories.find(c => c.id === parentId)?.name || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý danh mục</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý danh mục khóa học (hỗ trợ danh mục con)</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm danh mục
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle className="text-rose-600" size={24} />
          <div>
            <p className="font-semibold text-rose-800">Lỗi khi tải dữ liệu</p>
            <p className="text-sm text-rose-600">Vui lòng thử lại sau.</p>
          </div>
        </div>
      )}

      {/* Categories Table */}
      {!isLoading && !error && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Danh mục cha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Số khóa học</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      Không có danh mục nào
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => {
                    const parentName = getParentName(category.parentId ?? null);
                    return (
                      <tr key={category.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {category.imageUrl ? (
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FolderTree size={20} className="text-indigo-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{category.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">ID: {category.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {parentName ? (
                            <span className="text-sm text-slate-600 dark:text-slate-300">{parentName}</span>
                          ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500 italic">Danh mục gốc</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{category.countCourses}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingCategory(category.id)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <CategoryModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => {
            createMutation.mutate(data as CreateCategoryBody, {
              onSuccess: () => {
                setIsCreateModalOpen(false);
              },
            });
          }}
          isLoading={createMutation.isPending}
          categories={categories || []}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryModal
          categoryId={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSubmit={(data) => {
            updateMutation.mutate(
              { id: editingCategory, body: data },
              {
                onSuccess: () => {
                  setEditingCategory(null);
                },
              }
            );
          }}
          isLoading={updateMutation.isPending}
          categories={categories || []}
        />
      )}
    </div>
  );
};

// Category Modal Component
type CategoryModalProps = {
  categoryId?: string;
  onClose: () => void;
  onSubmit: (data: CreateCategoryBody | UpdateCategoryBody) => void;
  isLoading: boolean;
  categories: AdminCategory[];
};

const CategoryModal = ({ categoryId, onClose, onSubmit, isLoading, categories }: CategoryModalProps) => {
  const { data: categoryData } = useAdminCategory(categoryId || '');
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    parentId: '',
  });

  // Load category data when editing
  useEffect(() => {
    if (categoryData && categoryId) {
      setFormData({
        name: categoryData.name,
        imageUrl: categoryData.imageUrl || '',
        parentId: categoryData.parentId || '',
      });
    } else {
      // Reset form when creating new
      setFormData({
        name: '',
        imageUrl: '',
        parentId: '',
      });
    }
  }, [categoryData, categoryId]);

  // Filter out current category from parent options (to prevent circular reference)
  const availableParents = categories.filter(c => c.id !== categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: CreateCategoryBody | UpdateCategoryBody = {
      name: formData.name,
      imageUrl: formData.imageUrl || undefined,
    };
    if (categoryId) {
      // Update
      (submitData as UpdateCategoryBody).parentId = formData.parentId || null;
    } else {
      // Create
      (submitData as CreateCategoryBody).parentId = formData.parentId || undefined;
    }
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {categoryId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Tên danh mục *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="Nhập tên danh mục"
            />
          </div>
          <div>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              label="Hình ảnh danh mục"
              folder="categories"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Danh mục cha</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="">Không có (Danh mục gốc)</option>
              {availableParents.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;

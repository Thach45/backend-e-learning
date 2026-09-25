import { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { useUploadFile, useUploadImage } from '../../hooks/useUpload';
import { useCreateDocument } from '../../hooks/useDocuments';
import { useDocumentCategories } from '../../hooks/useDocumentCategories';
import { useDocumentTags } from '../../hooks/useDocumentTags';
import type { MaterialType } from '../../api/documents';
import { toast } from 'sonner';

type UploadDocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FILE_TYPE_MAP: Record<string, MaterialType> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOC',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPT',
  'application/zip': 'ZIP',
  'application/x-rar-compressed': 'ZIP',
};

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
  'ĐH Sư Phạm Hà Nội',
  'ĐH Y Hà Nội',
  'Khác',
];

const UploadDocumentModal = ({ isOpen, onClose }: UploadDocumentModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    university: '',
    subject: '',
    pages: '',
  });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState<MaterialType>('PDF');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: categoriesData } = useDocumentCategories({ isActive: true });
  const { data: tagsData } = useDocumentTags({ isActive: true });
  const uploadFileMutation = useUploadFile();
  const uploadImageMutation = useUploadImage();
  const createDocumentMutation = useCreateDocument();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const type = FILE_TYPE_MAP[file.type];
    if (!type) {
      toast.error('Định dạng file không được hỗ trợ. Vui lòng chọn PDF, DOC, DOCX, PPT, PPTX hoặc ZIP.');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 50MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadFileMutation.mutateAsync({
        file,
        onProgress: setUploadProgress,
      });
      setFileUrl(result.url);
      setFileType(type);
      
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setFormData(prev => ({ ...prev, title: fileName }));
      }
      
      toast.success('Upload file thành công!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload file thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      const result = await uploadImageMutation.mutateAsync(file);
      setThumbnailUrl(result.url);
      toast.success('Upload ảnh bìa thành công!');
    } catch (error) {
      console.error('Upload thumbnail failed:', error);
      toast.error('Upload ảnh bìa thất bại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileUrl) {
      toast.error('Vui lòng upload file tài liệu');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề tài liệu');
      return;
    }

    try {
      await createDocumentMutation.mutateAsync({
        title: formData.title.trim(),
        type: fileType,
        url: fileUrl,
        categoryId: formData.categoryId || undefined,
        university: formData.university.trim() || undefined,
        subject: formData.subject.trim() || undefined,
        pages: formData.pages ? parseInt(formData.pages) : undefined,
        thumbnail: thumbnailUrl || undefined,
        tagIds: selectedTagIds,
      });

      toast.success('Đăng tài liệu thành công!');
      handleClose();
    } catch (error: any) {
      console.error('Create document failed:', error);
      toast.error(error?.response?.data?.message || 'Đăng tài liệu thất bại. Vui lòng thử lại.');
    }
  };

  const handleClose = () => {
    setFormData({ title: '', categoryId: '', university: '', subject: '', pages: '' });
    setSelectedTagIds([]);
    setFileUrl('');
    setThumbnailUrl('');
    setUploadProgress(0);
    onClose();
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : prev.length < 10 ? [...prev, tagId] : prev
    );
  };

  if (!isOpen) return null;

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Đăng tài liệu mới</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              File tài liệu <span className="text-rose-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
              onChange={handleFileSelect}
              className="hidden"
            />
            {fileUrl ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <FileText className="text-emerald-600" size={24} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800">File đã upload thành công</p>
                  <p className="text-xs text-emerald-600 truncate">{fileUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFileUrl(''); fileInputRef.current?.click(); }}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors text-center"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <p className="text-sm text-slate-600 dark:text-slate-300">Đang upload... {uploadProgress}%</p>
                    <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="text-slate-400 dark:text-slate-500" size={32} />
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Kéo thả hoặc click để chọn file
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      PDF, DOC, DOCX, PPT, PPTX, ZIP (tối đa 50MB)
                    </p>
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nhập tiêu đề tài liệu..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category & University */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Lĩnh vực
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-900"
              >
                <option value="">Chọn lĩnh vực</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Trường đại học
              </label>
              <select
                value={formData.university}
                onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-900"
              >
                <option value="">Chọn trường đại học</option>
                {UNIVERSITIES.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject & Pages */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Môn học
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="VD: Giải tích 1"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Số trang
              </label>
              <input
                type="number"
                min="1"
                value={formData.pages}
                onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                placeholder="VD: 50"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Ảnh bìa (tùy chọn)
            </label>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />
            {thumbnailUrl ? (
              <div className="flex items-center gap-4">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                />
                <button
                  type="button"
                  onClick={() => { setThumbnailUrl(''); thumbnailInputRef.current?.click(); }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Thay đổi ảnh
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={uploadImageMutation.isPending}
                className="flex items-center gap-3 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors"
              >
                {uploadImageMutation.isPending ? (
                  <Loader2 className="animate-spin text-slate-400 dark:text-slate-500" size={20} />
                ) : (
                  <ImageIcon className="text-slate-400 dark:text-slate-500" size={20} />
                )}
                <span className="text-sm text-slate-600 dark:text-slate-300">Chọn ảnh bìa</span>
              </button>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Từ khóa (chọn tối đa 10)
            </label>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 border border-slate-300 dark:border-slate-700 rounded-xl max-h-40 overflow-y-auto">
                {tags.map(tag => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                        isSelected 
                          ? 'ring-2 ring-indigo-500 ring-offset-1' 
                          : 'hover:opacity-80'
                      }`}
                      style={{ 
                        backgroundColor: tag.color ? `${tag.color}20` : '#f1f5f9',
                        color: tag.color || '#475569'
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">Chưa có từ khóa nào</p>
            )}
            {selectedTagIds.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Đã chọn {selectedTagIds.length} từ khóa
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createDocumentMutation.isPending || !fileUrl}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createDocumentMutation.isPending && <Loader2 className="animate-spin" size={18} />}
              Đăng tài liệu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;


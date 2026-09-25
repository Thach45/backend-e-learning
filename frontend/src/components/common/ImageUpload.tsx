import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useUploadImage } from '../../hooks/useUpload';

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  folder?: string;
};

const ImageUpload = ({
  value,
  onChange,
  label = 'Hình ảnh',
  required = false,
  className = '',
  folder,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const uploadMutation = useUploadImage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const result = await uploadMutation.mutateAsync(file);
      onChange(result.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload ảnh thất bại. Vui lòng thử lại.');
      setPreview(null);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {/* Preview */}
        {preview && (
          <div className="relative w-full h-48 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadMutation.isPending}
          />
          <button
            type="button"
            onClick={handleClick}
            disabled={uploadMutation.isPending}
            className={`w-full px-4 py-3 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 ${
              uploadMutation.isPending
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-not-allowed'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">Đang tải lên...</span>
              </>
            ) : (
              <>
                <Upload size={18} className="text-slate-600 dark:text-slate-300" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {preview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                </span>
              </>
            )}
          </button>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
            JPG, PNG hoặc WEBP (tối đa 5MB)
          </p>
        </div>

        {/* URL Input (Fallback) */}
        {!preview && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Hoặc nhập link ảnh
            </label>
            <div className="relative">
              <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="url"
                value={value || ''}
                onChange={(e) => {
                  onChange(e.target.value);
                  setPreview(e.target.value || null);
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;


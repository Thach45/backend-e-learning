import { useState, useRef } from 'react';
import { Upload, X, Video, Loader2, AlertCircle } from 'lucide-react';
import { uploadApi } from '../../api/upload';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string, duration?: number) => void;
  onError?: (error: string) => void;
  className?: string;
}

const VideoUpload = ({ value, onChange, onError, className = '' }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/flv', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Định dạng video không hợp lệ. Chỉ chấp nhận: MP4, MOV, AVI, WMV, FLV, WEBM';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      const errorMsg = 'Kích thước video quá lớn. Tối đa 500MB';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadApi.uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });

      onChange(result.url, result.duration);
      setUploading(false);
      setUploadProgress(0);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi upload video';
      setError(errorMsg);
      onError?.(errorMsg);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        {value ? (
          <div className="relative border-2 border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Video className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Video đã upload</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">{value}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
              uploading
                ? 'border-blue-300 bg-blue-50'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:bg-slate-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/mov,video/avi,video/wmv,video/flv,video/webm"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            {uploading ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Đang upload video...</p>
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{uploadProgress}%</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Click để upload video hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Hỗ trợ: MP4, MOV, AVI, WMV, FLV, WEBM (Tối đa 500MB)
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {value && !error && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <p>Video URL: {value}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;


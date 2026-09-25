import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreatePermission, useUpdatePermission } from '../../hooks/usePermissions';
import type { Permission, PermissionMethod } from '../../api/permissions';

type PermissionFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  permission?: Permission | null; // null = create mode, Permission = edit mode
};

const METHODS: PermissionMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export const PermissionFormModal = ({ isOpen, onClose, permission }: PermissionFormModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('');
  const [method, setMethod] = useState<PermissionMethod>('GET');

  const createMutation = useCreatePermission();
  const updateMutation = useUpdatePermission();

  const isEditMode = !!permission;

  // Reset form when modal opens/closes or permission changes
  useEffect(() => {
    if (isOpen) {
      if (permission) {
        setName(permission.name);
        setDescription(permission.description || '');
        setPath(permission.path);
        setMethod(permission.method);
      } else {
        setName('');
        setDescription('');
        setPath('');
        setMethod('GET');
      }
    }
  }, [isOpen, permission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !path.trim()) {
      return;
    }

    const body = {
      name: name.trim(),
      description: description.trim() || undefined,
      path: path.trim(),
      method,
    };

    if (isEditMode && permission) {
      updateMutation.mutate({ id: permission.id, body }, { onSuccess: onClose });
    } else {
      createMutation.mutate(body, { onSuccess: onClose });
    }
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {isEditMode ? 'Sửa Permission' : 'Tạo Permission mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Tên Permission <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="VD: Quản lý người dùng"
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              placeholder="Mô tả về permission này..."
              disabled={isLoading}
            />
          </div>

          {/* Path */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              API Path <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="/api/users"
              required
              disabled={isLoading}
            />
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              HTTP Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PermissionMethod)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isLoading}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !name.trim() || !path.trim()}
            >
              {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


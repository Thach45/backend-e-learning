import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateRole, useUpdateRole } from '../../hooks/useRoles';
import type { Role, RoleName } from '../../api/roles';

type RoleFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null; // null = create mode, Role = edit mode
};

const ROLE_NAMES: RoleName[] = ['ADMIN', 'CLIENT', 'INSTRUCTOR'];

export const RoleFormModal = ({ isOpen, onClose, role }: RoleFormModalProps) => {
  const [name, setName] = useState<RoleName>('CLIENT');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const isEditMode = !!role;

  // Reset form when modal opens/closes or role changes
  useEffect(() => {
    if (isOpen) {
      if (role) {
        setName(role.name);
        setDescription(role.description || '');
        setIsActive(role.isActive);
      } else {
        setName('CLIENT');
        setDescription('');
        setIsActive(true);
      }
    }
  }, [isOpen, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      name,
      description: description.trim() || undefined,
      isActive,
    };

    if (isEditMode && role) {
      updateMutation.mutate({ id: role.id, body }, { onSuccess: onClose });
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
            {isEditMode ? 'Sửa Role' : 'Tạo Role mới'}
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
              Tên Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value as RoleName)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isLoading || isEditMode} // Không cho sửa name khi edit
            >
              {ROLE_NAMES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {isEditMode && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Không thể thay đổi tên role sau khi tạo</p>
            )}
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
              placeholder="Mô tả về role này..."
              disabled={isLoading}
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500"
              disabled={isLoading}
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
              Kích hoạt role
            </label>
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
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


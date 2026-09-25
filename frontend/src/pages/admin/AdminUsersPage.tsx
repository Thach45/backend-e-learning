import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Loader2, AlertCircle, Save } from 'lucide-react';
import { useAdminUsers, useCreateAdminUser, useUpdateAdminUser, useDeleteAdminUser, useUpdateAdminUserStatus, useAdminUser } from '../../hooks/useAdminUsers';
import type { UserStatus, UserRole, CreateUserBody, UpdateUserBody } from '../../api/admin';
import ExportCsvButton from '../../components/admin/ExportCsvButton';

const AdminUsersPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminUsers({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus as UserStatus : undefined,
    role: selectedRole !== 'ALL' ? selectedRole as UserRole : undefined,
  });

  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();
  const updateStatusMutation = useUpdateAdminUserStatus();

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusBadge = (status: UserStatus) => {
    const map: Record<UserStatus, { label: string; color: string }> = {
      ACTIVE: { label: 'Hoạt động', color: 'bg-emerald-50 text-emerald-700' },
      INACTIVE: { label: 'Không hoạt động', color: 'bg-amber-50 text-amber-700' },
      BLOCKED: { label: 'Bị khóa', color: 'bg-rose-50 text-rose-700' },
    };
    return map[status] || { label: status, color: 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200' };
  };

  const getRoleBadge = (role: UserRole) => {
    const map: Record<UserRole, { label: string; color: string }> = {
      ADMIN: { label: 'ADMIN', color: 'bg-purple-50 text-purple-700' },
      INSTRUCTOR: { label: 'INSTRUCTOR', color: 'bg-blue-50 text-blue-700' },
      CLIENT: { label: 'CLIENT', color: 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200' },
    };
    return map[role] || { label: role, color: 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200' };
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: UserStatus) => {
    updateStatusMutation.mutate({ id, body: { status: newStatus } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý người dùng</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportCsvButton resource="users" />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Lọc theo:</span>
          <div className="flex gap-2">
            {['ALL', 'ACTIVE', 'INACTIVE', 'BLOCKED'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {status === 'ALL' ? 'Tất cả' : 
                 status === 'ACTIVE' ? 'Hoạt động' : 
                 status === 'INACTIVE' ? 'Không hoạt động' : 'Bị khóa'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-4">
            {['ALL', 'ADMIN', 'INSTRUCTOR', 'CLIENT'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selectedRole === role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {role === 'ALL' ? 'Tất cả vai trò' : role}
              </button>
            ))}
          </div>
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

      {/* Users Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Vai trò</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        Không có người dùng nào
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <span key={role} className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(role).color}`}>
                                {getRoleBadge(role).label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
                            className={`px-2 py-1 rounded-full text-xs font-semibold border-0 outline-none cursor-pointer ${getStatusBadge(user.status).color}`}
                          >
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Không hoạt động</option>
                            <option value="BLOCKED">Bị khóa</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingUser(user.id)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <UserModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => {
            createMutation.mutate(data as CreateUserBody, {
              onSuccess: () => {
                setIsCreateModalOpen(false);
              },
            });
          }}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserModal
          userId={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => {
            updateMutation.mutate(
              { id: editingUser, body: data },
              {
                onSuccess: () => {
                  setEditingUser(null);
                },
              }
            );
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
};

// User Modal Component
type UserModalProps = {
  userId?: string;
  onClose: () => void;
  onSubmit: (data: CreateUserBody | UpdateUserBody) => void;
  isLoading: boolean;
};

const UserModal = ({ userId, onClose, onSubmit, isLoading }: UserModalProps) => {
  const { data: userData } = useAdminUser(userId || '');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phoneNumber: '',
    avatar: '',
    roles: [] as UserRole[],
  });

  // Load user data when editing
  useEffect(() => {
    if (userData) {
      setFormData({
        email: userData.email,
        password: '',
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        avatar: userData.avatar || '',
        roles: userData.roles,
      });
    }
  }, [userData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) {
      // Update
      const updateData: UpdateUserBody = {
        email: formData.email,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        avatar: formData.avatar || undefined,
        roles: formData.roles,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      onSubmit(updateData);
    } else {
      // Create
      onSubmit({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        avatar: formData.avatar || undefined,
      } as CreateUserBody);
    }
  };

  const toggleRole = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {userId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
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
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Mật khẩu {userId ? '(để trống nếu không đổi)' : '*'}
            </label>
            <input
              type="password"
              required={!userId}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Tên *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Số điện thoại *</label>
            <input
              type="text"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Avatar URL</label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          {userId && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Vai trò</label>
              <div className="flex gap-2">
                {(['ADMIN', 'INSTRUCTOR', 'CLIENT'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      formData.roles.includes(role)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}
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

export default AdminUsersPage;

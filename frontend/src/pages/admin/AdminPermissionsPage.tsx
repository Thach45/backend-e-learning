import { useState } from 'react';
import { Shield, Plus, Edit, Trash2, Users, Lock, Loader2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRoles, useDeleteRole } from '../../hooks/useRoles';
import { usePermissions, useDeletePermission } from '../../hooks/usePermissions';
import { PermissionFormModal } from '../../components/admin/PermissionFormModal';
import { RoleFormModal } from '../../components/admin/RoleFormModal';
import { RolePermissionsManager } from '../../components/admin/RolePermissionsManager';
import type { Role } from '../../api/roles';
import type { Permission } from '../../api/permissions';

const AdminPermissionsPage = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [rolePermissionsModalOpen, setRolePermissionsModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [permissionsPage, setPermissionsPage] = useState(1);
  const [permissionsLimit] = useState(10);

  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const { data: permissionsData, isLoading: isLoadingPermissions } = usePermissions({ 
    page: permissionsPage, 
    limit: permissionsLimit 
  });
  const deleteRoleMutation = useDeleteRole();
  const deletePermissionMutation = useDeletePermission();

  const roles = rolesData || [];
  const permissions = permissionsData?.data || [];

  const handleCreatePermission = () => {
    setEditingPermission(null);
    setPermissionModalOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setPermissionModalOpen(true);
  };

  const handleDeletePermission = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa permission này?')) {
      deletePermissionMutation.mutate(id);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleModalOpen(true);
  };

  const handleDeleteRole = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa role này? Hành động này không thể hoàn tác.')) {
      deleteRoleMutation.mutate(id);
    }
  };

  const handleManageRolePermissions = (roleId: string) => {
    setSelectedRoleId(roleId);
    setRolePermissionsModalOpen(true);
  };

  // Reset permissions page when switching tabs
  const handleTabChange = (tab: 'roles' | 'permissions') => {
    setActiveTab(tab);
    if (tab === 'permissions') {
      setPermissionsPage(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý phân quyền</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý Role và Permission theo RBAC</p>
        </div>
        <button
          onClick={activeTab === 'roles' ? handleCreateRole : handleCreatePermission}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {activeTab === 'roles' ? 'Thêm Role' : 'Thêm Permission'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => handleTabChange('roles')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'roles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            Roles ({roles.length})
          </div>
        </button>
        <button
          onClick={() => handleTabChange('permissions')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'permissions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock size={18} />
            Permissions ({permissionsData?.total || 0})
          </div>
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoadingRoles ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Mô tả</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Số Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        Chưa có role nào
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Shield size={20} className="text-indigo-600" />
                            <span className="font-semibold text-slate-800 dark:text-slate-100">{role.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{role.description || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {role.rolePermissions?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            role.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200'
                          }`}>
                            {role.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleManageRolePermissions(role.id)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Quản lý permissions"
                            >
                              <Settings size={16} />
                            </button>
                            <button
                              onClick={() => handleEditRole(role)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Sửa role"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              disabled={deleteRoleMutation.isPending}
                              title="Xóa role"
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
          )}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoadingPermissions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Permission</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Path</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Mô tả</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {permissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        Chưa có permission nào
                      </td>
                    </tr>
                  ) : (
                    permissions.map((permission) => (
                      <tr key={permission.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{permission.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-200">{permission.path}</code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            permission.method === 'GET' ? 'bg-blue-50 text-blue-700' :
                            permission.method === 'POST' ? 'bg-emerald-50 text-emerald-700' :
                            permission.method === 'PUT' || permission.method === 'PATCH' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {permission.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{permission.description || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditPermission(permission)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Sửa permission"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePermission(permission.id)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              disabled={deletePermissionMutation.isPending}
                              title="Xóa permission"
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
          )}

          {/* Pagination */}
          {permissionsData && permissionsData.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Hiển thị <span className="font-semibold">{permissions.length}</span> /{' '}
                <span className="font-semibold">{permissionsData.total}</span> permissions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPermissionsPage((prev) => Math.max(1, prev - 1))}
                  disabled={permissionsPage === 1 || isLoadingPermissions}
                  className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: permissionsData.totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === permissionsData.totalPages ||
                      (page >= permissionsPage - 1 && page <= permissionsPage + 1);

                    if (!showPage) {
                      // Show ellipsis
                      if (page === permissionsPage - 2 || page === permissionsPage + 2) {
                        return (
                          <span key={page} className="px-2 text-slate-400 dark:text-slate-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setPermissionsPage(page)}
                        disabled={isLoadingPermissions}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                          page === permissionsPage
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    setPermissionsPage((prev) => Math.min(permissionsData.totalPages, prev + 1))
                  }
                  disabled={permissionsPage === permissionsData.totalPages || isLoadingPermissions}
                  className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PermissionFormModal
        isOpen={permissionModalOpen}
        onClose={() => {
          setPermissionModalOpen(false);
          setEditingPermission(null);
        }}
        permission={editingPermission}
      />

      <RoleFormModal
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setEditingRole(null);
        }}
        role={editingRole}
      />

      <RolePermissionsManager
        isOpen={rolePermissionsModalOpen}
        onClose={() => {
          setRolePermissionsModalOpen(false);
          setSelectedRoleId('');
        }}
        roleId={selectedRoleId}
      />
    </div>
  );
};

export default AdminPermissionsPage;


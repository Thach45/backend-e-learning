import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useRole, useAssignPermissions, useUnassignPermissions } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import type { Permission } from '../../api/roles';


type RolePermissionsManagerProps = {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
};

export const RolePermissionsManager = ({ isOpen, onClose, roleId }: RolePermissionsManagerProps) => {
  const { data: roleResponse, isLoading: isLoadingRole } = useRole(roleId);
  // Handle response structure: {statusCode, message, data} or direct role object
  const roleData = (roleResponse as any)?.data || roleResponse;
  const { data: permissionsData, isLoading: isLoadingPermissions } = usePermissions({page: 1, limit: 1000 });
  const assignMutation = useAssignPermissions();
  const unassignMutation = useUnassignPermissions();

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());

  // Initialize selected permissions from role
  useEffect(() => {
    if (!roleData) {
      setSelectedPermissionIds(new Set());
      return;
    }

    // Extract actual role object if wrapped in response structure
    const actualRole = (roleData as any)?.data || roleData;

    let permissionIds: string[] = [];

    // Check rolePermissions first (raw from Prisma)
    if (actualRole.rolePermissions && Array.isArray(actualRole.rolePermissions) && actualRole.rolePermissions.length > 0) {
      // rolePermissions is an array of { permission: Permission } objects from Prisma include
      permissionIds = actualRole.rolePermissions
        .map((rp: any) => {
          // Handle format: { permission: {...} }
          if (rp.permission && rp.permission.id) {
            return rp.permission.id;
          }
          // Fallback: direct permission object
          if (rp.id && !rp.roleId) {
            return rp.id;
          }
          return null;
        })
        .filter(Boolean) as string[];
    }
    // Fallback: check permissions (transformed flat array)
    else if ((actualRole as any).permissions && Array.isArray((actualRole as any).permissions) && (actualRole as any).permissions.length > 0) {
      permissionIds = (actualRole as any).permissions.map((p: Permission) => p.id).filter(Boolean);
    }

    setSelectedPermissionIds(new Set(permissionIds));
  }, [roleData]);

  const handleTogglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissionIds);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissionIds(newSelected);
  };

  const handleSave = () => {
    if (!roleData) return;

    // Extract actual role object if wrapped in response structure
    const actualRole = (roleData as any)?.data || roleData;

    // Get current permission IDs from role
    let currentPermissionIds: Set<string> = new Set();
    
    // Check rolePermissions first (raw from Prisma)
    if (actualRole.rolePermissions && Array.isArray(actualRole.rolePermissions) && actualRole.rolePermissions.length > 0) {
      const ids = actualRole.rolePermissions
        .map((rp: any) => {
          if (rp.permission && rp.permission.id) {
            return rp.permission.id;
          }
          if (rp.id && !rp.roleId) {
            return rp.id;
          }
          return null;
        })
        .filter(Boolean) as string[];
      currentPermissionIds = new Set(ids);
    }
    // Fallback: check permissions (transformed flat array)
    else if ((actualRole as any).permissions && Array.isArray((actualRole as any).permissions) && (actualRole as any).permissions.length > 0) {
      currentPermissionIds = new Set((actualRole as any).permissions.map((p: Permission) => p.id).filter(Boolean));
    }

    const toAssign = Array.from(selectedPermissionIds).filter((id) => !currentPermissionIds.has(id));
    const toUnassign = Array.from(currentPermissionIds).filter((id) => !selectedPermissionIds.has(id));

    // Assign new permissions
    if (toAssign.length > 0) {
      assignMutation.mutate(
        {
          roleId,
          body: { permissionIds: toAssign },
        },
        {
          onSuccess: () => {
            if (toUnassign.length === 0) {
              onClose();
            }
          },
        }
      );
    }

    // Unassign removed permissions
    if (toUnassign.length > 0) {
      unassignMutation.mutate(
        {
          roleId,
          body: { permissionIds: toUnassign },
        },
        {
          onSuccess: () => {
            if (toAssign.length === 0) {
              onClose();
            }
          },
        }
      );
    }

    // If no changes, just close
    if (toAssign.length === 0 && toUnassign.length === 0) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = isLoadingRole || isLoadingPermissions || assignMutation.isPending || unassignMutation.isPending;
  const permissions = permissionsData?.data || [];
  
  // Extract actual role object if wrapped in response structure
  const actualRole = roleData ? ((roleData as any)?.data || roleData) : null;
  
  // Extract permissions from rolePermissions array
  // rolePermissions comes as [{ permission: {...} }] from Prisma include
  let rolePermissions: Permission[] = [];
  
  if (actualRole?.rolePermissions && Array.isArray(actualRole.rolePermissions) && actualRole.rolePermissions.length > 0) {
    rolePermissions = actualRole.rolePermissions
      .map((rp: any) => {
        // Handle format: { permission: {...} }
        if (rp.permission && rp.permission.id) {
          return rp.permission;
        }
        // Fallback: direct permission object (shouldn't happen with Prisma include)
        if (rp.id && !rp.roleId && !rp.permissionId) {
          return rp;
        }
        return null;
      })
      .filter(Boolean) as Permission[];
  }
  // Fallback: use permissions (transformed flat array from service)
  else if ((actualRole as any)?.permissions && Array.isArray((actualRole as any).permissions)) {
    rolePermissions = (actualRole as any).permissions;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý Permissions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Role: <span className="font-semibold">{roleData?.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && !permissions.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <p>Chưa có permission nào trong hệ thống</p>
                </div>
              ) : (
                permissions.map((permission) => {
                  const isSelected = selectedPermissionIds.has(permission.id);
                  const wasAssigned = rolePermissions.some((p: Permission) => p.id === permission.id);
                  const isChanged = isSelected !== wasAssigned;

                return (
                  <label
                    key={permission.id}
                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700'
                    } ${isChanged ? 'ring-2 ring-amber-300' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePermission(permission.id)}
                      className="mt-1 w-5 h-5 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{permission.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            permission.method === 'GET'
                              ? 'bg-blue-50 text-blue-700'
                              : permission.method === 'POST'
                              ? 'bg-emerald-50 text-emerald-700'
                              : permission.method === 'PUT' || permission.method === 'PATCH'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {permission.method}
                        </span>
                        {isChanged && (
                          <span className="text-xs text-amber-600 font-medium">
                            {isSelected ? '(Thêm mới)' : '(Sẽ gỡ)'}
                          </span>
                        )}
                      </div>
                      <code className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {permission.path}
                      </code>
                      {permission.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{permission.description}</p>
                      )}
                    </div>
                  </label>
                );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Đã chọn: <span className="font-semibold">{selectedPermissionIds.size}</span> / {permissions.length}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Đang lưu...
                </span>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


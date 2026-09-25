import { useQuery } from '@tanstack/react-query';
import { auditLogsApi, type GetAuditLogsParams } from '../api/auditLogs';

export const useAuditLogs = (params?: GetAuditLogsParams) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogsApi.getLogs(params),
  });
};

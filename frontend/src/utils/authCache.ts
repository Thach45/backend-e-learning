import { QueryClient } from '@tanstack/react-query';

/**
 * Invalidate auth cache - dùng khi logout hoặc khi cần refresh user info
 */
export const invalidateAuthCache = (queryClient: QueryClient) => {
  queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
};

/**
 * Clear auth cache - dùng khi logout
 */
export const clearAuthCache = (queryClient: QueryClient) => {
  queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  queryClient.removeQueries({ queryKey: ['user'] });
};


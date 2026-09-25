import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '../api/gamification';
import { useAuthStatus } from './useAuthStatus';

export const useMyBadges = () => {
  const { isAuthenticated } = useAuthStatus();
  return useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: () => gamificationApi.getMyBadges(),
    enabled: isAuthenticated,
  });
};

export const useStreak = () => {
  const { isAuthenticated } = useAuthStatus();
  return useQuery({
    queryKey: ['gamification', 'streak'],
    queryFn: () => gamificationApi.getStreak(),
    enabled: isAuthenticated,
  });
};

export const useLeaderboard = () => {
  const { isAuthenticated } = useAuthStatus();
  return useQuery({
    queryKey: ['gamification', 'leaderboard'],
    queryFn: () => gamificationApi.getLeaderboard(),
    enabled: isAuthenticated,
  });
};

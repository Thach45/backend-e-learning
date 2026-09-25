import apiClient from './axios';

export const SOCIAL_FIELDS = [
  { key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'twitterUrl', label: 'X (Twitter)', placeholder: 'https://x.com/...' },
  { key: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
  { key: 'linkedinUrl', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
  { key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  { key: 'zaloUrl', label: 'Zalo', placeholder: 'https://zalo.me/...' },
] as const;

export type SocialKey = (typeof SOCIAL_FIELDS)[number]['key'];

export type PublicSiteSettings = {
  social: Record<SocialKey, string | null>;
  maintenance: { enabled: boolean; message: string | null; until: string | null };
};

export type AdminSiteSettings = Record<SocialKey, string | null> & {
  maintenanceEnabled: boolean;
  maintenanceMessage: string | null;
  maintenanceUntil: string | null;
  updatedAt: string | null;
};

export type UpdateSiteSettingsBody = Partial<Record<SocialKey, string | null>> & {
  maintenanceEnabled?: boolean;
  maintenanceMessage?: string | null;
  maintenanceUntil?: string | null;
};

export const siteSettingsApi = {
  getPublic: async (): Promise<PublicSiteSettings> => {
    const res = await apiClient.get('/settings/public');
    return res.data.data;
  },
  getAdmin: async (): Promise<AdminSiteSettings> => {
    const res = await apiClient.get('/admin/settings');
    return res.data.data;
  },
  update: async (body: UpdateSiteSettingsBody): Promise<AdminSiteSettings> => {
    const res = await apiClient.put('/admin/settings', body);
    return res.data.data;
  },
};

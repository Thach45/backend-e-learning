import apiClient from './axios';

export type HomeBanner = { id: string; title: string; subtitle: string | null; imageUrl: string; linkUrl: string | null; ctaLabel: string | null };
export type HomeTestimonial = { id: string; name: string; role: string | null; avatarUrl: string | null; content: string; rating: number | null };
export type HomeConfig = {
  hero: { title: string | null; subtitle: string | null };
  sections: { categories: boolean; featured: boolean; testimonials: boolean; latestPosts: boolean };
  banners: HomeBanner[];
  testimonials: HomeTestimonial[];
  latestPosts: { slug: string; title: string; excerpt: string | null; coverUrl: string | null; publishedAt: string | null }[];
  stats: { learners: number; courses: number; avgRating: number | null; reviews: number };
};
export type HomeSettings = { heroTitle: string | null; heroSubtitle: string | null; showCategories: boolean; showFeatured: boolean; showTestimonials: boolean; showLatestPosts: boolean };
export type AdminBanner = HomeBanner & { position: number; isActive: boolean; startsAt: string | null; endsAt: string | null };
export type AdminTestimonial = HomeTestimonial & { position: number; isActive: boolean };
export type BannerForm = { title: string; subtitle?: string | null; imageUrl: string; linkUrl?: string | null; ctaLabel?: string | null; position?: number; isActive?: boolean; startsAt?: string | null; endsAt?: string | null };
export type TestimonialForm = { name: string; role?: string | null; avatarUrl?: string | null; content: string; rating?: number | null; position?: number; isActive?: boolean };

export const homeApi = {
  config: async (): Promise<HomeConfig> => (await apiClient.get('/home')).data.data,
  settings: async (): Promise<HomeSettings> => (await apiClient.get('/admin/home/settings')).data.data,
  saveSettings: async (b: Partial<HomeSettings>): Promise<HomeSettings> => (await apiClient.put('/admin/home/settings', b)).data.data,
  banners: async (): Promise<AdminBanner[]> => (await apiClient.get('/admin/home/banners')).data.data,
  createBanner: async (b: BannerForm) => (await apiClient.post('/admin/home/banners', b)).data.data,
  updateBanner: async (id: string, b: Partial<BannerForm>) => (await apiClient.put(`/admin/home/banners/${id}`, b)).data.data,
  deleteBanner: async (id: string) => (await apiClient.delete(`/admin/home/banners/${id}`)).data.data,
  testimonials: async (): Promise<AdminTestimonial[]> => (await apiClient.get('/admin/home/testimonials')).data.data,
  createTestimonial: async (b: TestimonialForm) => (await apiClient.post('/admin/home/testimonials', b)).data.data,
  updateTestimonial: async (id: string, b: Partial<TestimonialForm>) => (await apiClient.put(`/admin/home/testimonials/${id}`, b)).data.data,
  deleteTestimonial: async (id: string) => (await apiClient.delete(`/admin/home/testimonials/${id}`)).data.data,
};

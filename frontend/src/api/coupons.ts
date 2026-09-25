import { apiClient } from './axios';

export type CouponType = 'PERCENT' | 'FIXED';

export type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  minOrderAmount?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  perUserLimit: number;
  courseIds: string[];
  isActive: boolean;
  usedCount: number;
  createdAt: string;
};

export type CouponFormBody = {
  code?: string;
  description?: string | null;
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  minOrderAmount?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  perUserLimit: number;
  courseIds: string[];
  isActive: boolean;
};

export type GetCouponsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'expired';
};

export type GetCouponsResponse = {
  data: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ValidatedCoupon = {
  code: string;
  description?: string | null;
  type: CouponType;
  value: number;
  subtotal: number;
  discountAmount: number;
  total: number;
};

export const couponsApi = {
  // Client: xem trước giảm giá trên giỏ hàng hiện tại
  validate: async (code: string): Promise<ValidatedCoupon> => {
    const response = await apiClient.post('/coupons/validate', { code });
    return response.data.data;
  },

  // Admin
  getCoupons: async (params?: GetCouponsParams): Promise<GetCouponsResponse> => {
    const response = await apiClient.get('/admin/coupons', { params });
    return response.data.data;
  },
  createCoupon: async (body: CouponFormBody): Promise<Coupon> => {
    const response = await apiClient.post('/admin/coupons', body);
    return response.data.data;
  },
  updateCoupon: async (id: string, body: Omit<CouponFormBody, 'code'>): Promise<Coupon> => {
    const response = await apiClient.put(`/admin/coupons/${id}`, body);
    return response.data.data;
  },
  deleteCoupon: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/coupons/${id}`);
  },
};

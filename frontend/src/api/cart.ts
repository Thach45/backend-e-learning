import { apiClient } from "./axios";

type Instructor = {
    id: string;
    name: string;
};

type Course = {
    id: string;
    title: string;
    price: number;
    salePrice: number | null;
    thumbnail: string | null;
    instructor: Instructor | null;
};

export type CartItem = {
    id: string;
    cartId: string;
    courseId: string;
    createdAt: string;
    updatedAt: string;
    course: Course | null;
};

export type Cart = {
    id: string;
    userId: string;
    cartItems: CartItem[];
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
};

export type GetCartResponse = {
    cart: Cart | null;
    subtotal: number;
    total: number;
    itemCount: number;
};

export const cartApi = {
    // Get cart
    getCart: async (): Promise<GetCartResponse> => {
        const response = await apiClient.get('/cart');
        return response.data.data;
    },

    // Add to cart
    addToCart: async (courseId: string): Promise<GetCartResponse> => {
        const response = await apiClient.post('/cart/items', { courseId });
        return response.data.data;
    },

    // Remove from cart
    removeFromCart: async (courseId: string): Promise<GetCartResponse> => {
        const response = await apiClient.delete(`/cart/items/${courseId}`);
        return response.data.data;
    },

    // Clear cart
    clearCart: async (): Promise<void> => {
        await apiClient.delete('/cart');
    },
};
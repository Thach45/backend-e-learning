import { Injectable, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { Prisma } from "@prisma/client";

const cartItemSelect = {
  id: true,
  cartId: true,
  courseId: true,
  createdAt: true,
  updatedAt: true,
  course: {
    select: {
      id: true,
      title: true,
      thumbnail: true,
      price: true,
      salePrice: true,
      instructor: { select: { id: true, name: true } },
    },
  },
} as const;

@Injectable()
export class CartRepo {
    constructor(private readonly prisma: PrismaService) {}

    async getCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                cartItems: {
                    select: cartItemSelect,
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!cart) {
            return null;
        }

        // Calculate totals
        const subtotal = cart.cartItems.reduce((sum, item) => {
            const price = item.course?.salePrice || item.course?.price || 0;
            return sum + price;
        }, 0);

        return {
            cart,
            subtotal,
            total: subtotal,
            itemCount: cart.cartItems.length,
        };
    }

    async addToCart(userId: string, courseId: string) {
        // Validate course exists and is PUBLISHED
        const course = await this.prisma.course.findFirst({
            where: { id: courseId, deletedAt: null },
            select: { id: true, status: true },
        });
        if (!course) {
            throw new NotFoundException(`Course with ID ${courseId} not found`);
        }
        if (course.status !== "PUBLISHED") {
            throw new BadRequestException("Only PUBLISHED courses can be added to cart");
        }

        // Check if user already enrolled
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            select: { id: true },
        });
        if (enrollment) {
            throw new ConflictException("You are already enrolled in this course");
        }

        // Find or create cart
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!cart) {
            // Create cart with first item
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

            cart = await this.prisma.cart.create({
                data: {
                    userId,
                    expiresAt,
                    cartItems: {
                        create: {
                            courseId,
                        },
                    },
                },
                select: { id: true },
            });
        } else {
            // Check if course already in cart
            const existingItem = await this.prisma.cartItem.findUnique({
                where: {
                    cartId_courseId: {
                        cartId: cart.id,
                        courseId,
                    },
                },
                select: { id: true },
            });

            if (existingItem) {
                throw new ConflictException("Course already in cart");
            }

            // Add item to existing cart
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await this.prisma.cart.update({
                where: { id: cart.id },
                data: {
                    expiresAt,
                    cartItems: {
                        create: {
                            courseId,
                        },
                    },
                },
            });
        }

        // Return updated cart with items
        return this.getCart(userId);
    }

    async removeFromCart(userId: string, courseId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!cart) {
            throw new NotFoundException("Cart not found");
        }

        // Delete cart item
        await this.prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                courseId,
            },
        });

        // Check if cart is empty, optionally delete cart
        const remainingItems = await this.prisma.cartItem.count({
            where: { cartId: cart.id },
        });

        if (remainingItems === 0) {
            await this.prisma.cart.delete({
                where: { id: cart.id },
            });
            return null;
        }

        return this.getCart(userId);
    }

    async clearCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!cart) {
            return null;
        }

        await this.prisma.cart.delete({
            where: { id: cart.id },
        });

        return null;
    }
}
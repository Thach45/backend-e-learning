import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryBodyDto, UpdateCategoryBodyDto } from './categories.dto';
import { CategoriesRepository } from './categories.repo';
import { CategoryResponse } from './categories.model';

type CategoryWithCourseCount = {
    id: string;
    name: string;
    imageUrl: string | null;
    parentId: string | null;
    _count: {
        courses: number;
    };
};

type AdminCategoryResponse = Omit<CategoryResponse, 'children'>;

@Injectable()
export class CategoriesService {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

    private toCategoryNode(category: CategoryWithCourseCount): CategoryResponse {
        return {
            id: category.id,
            name: category.name,
            imageUrl: category.imageUrl,
            parentId: category.parentId,
            countCourses: category._count.courses,
            children: [],
        };
    }

    private buildCategoryTree(categories: CategoryWithCourseCount[]): CategoryResponse[] {
        const nodeMap = new Map<string, CategoryResponse>();

        for (const category of categories) {
            nodeMap.set(category.id, this.toCategoryNode(category));
        }

        const roots: CategoryResponse[] = [];
        for (const category of categories) {
            const currentNode = nodeMap.get(category.id);
            if (!currentNode) continue;

            if (category.parentId && nodeMap.has(category.parentId)) {
                nodeMap.get(category.parentId)!.children.push(currentNode);
            } else {
                roots.push(currentNode);
            }
        }

        this.aggregateCourseCountBySubtree(roots);
        return roots;
    }

    private aggregateCourseCountBySubtree(nodes: CategoryResponse[]): number {
        let total = 0;
        for (const node of nodes) {
            const childrenTotal = this.aggregateCourseCountBySubtree(node.children);
            node.countCourses += childrenTotal;
            total += node.countCourses;
        }
        return total;
    }

    private extractCourseCountMapFromTree(nodes: CategoryResponse[]): Map<string, number> {
        const courseCountMap = new Map<string, number>();
        const stack = [...nodes];

        while (stack.length > 0) {
            const current = stack.pop();
            if (!current) continue;
            courseCountMap.set(current.id, current.countCourses);
            stack.push(...current.children);
        }

        return courseCountMap;
    }

    private toAdminCategory(category: CategoryWithCourseCount): AdminCategoryResponse {
        return {
            id: category.id,
            name: category.name,
            imageUrl: category.imageUrl,
            parentId: category.parentId,
            countCourses: category._count.courses,
        };
    }

    async getAllCategories()  {
        const categories = await this.categoriesRepository.findAllCategories();
        const data = this.buildCategoryTree(categories);
        return {
            data,
            total: data.length,
            page: 1,
            limit: data.length,
        };
    }
    async getAllAdminCategories() {
        const categories = await this.categoriesRepository.findAllCategoriesForAdmin();
        const tree = this.buildCategoryTree(categories);
        const countMap = this.extractCourseCountMapFromTree(tree);
        const data = categories.map((category) => ({
            ...this.toAdminCategory(category),
            countCourses: countMap.get(category.id) ?? category._count.courses,
        }));

        return {
            data,
            total: data.length,
            page: 1,
            limit: data.length,
        };
    }
    async createCategory(body: CreateCategoryBodyDto, user: any) {
        const category = await this.categoriesRepository.createCategory(body, user);
        return this.toCategoryNode(category);
    }
    async getCategoryById(id: string) {
        const categories = await this.categoriesRepository.findAllCategories();
        const tree = this.buildCategoryTree(categories);

        const stack = [...tree];
        while (stack.length > 0) {
            const current = stack.pop();
            if (!current) continue;
            if (current.id === id) {
                return current;
            }
            stack.push(...current.children);
        }

        throw new NotFoundException('Category not found');
    }
    async updateCategory(id: string, body: UpdateCategoryBodyDto, user: any) {
        const existingCategory = await this.categoriesRepository.findCategoryById(id);
        if (!existingCategory) {
            throw new NotFoundException('Category not found');
        }
        const updatedCategory = await this.categoriesRepository.updateCategory(id, body, user);
        return this.toCategoryNode(updatedCategory);
    }
}

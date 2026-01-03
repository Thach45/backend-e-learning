import { Injectable } from '@nestjs/common';
import { DocumentCategoriesRepository } from './document-categories.repo';
import {
  GetDocumentCategoriesQuery,
  CreateDocumentCategoryBody,
  UpdateDocumentCategoryBody,
} from './document-categories.model';

@Injectable()
export class DocumentCategoriesService {
  constructor(private readonly repo: DocumentCategoriesRepository) {}

  async getCategories(query: GetDocumentCategoriesQuery) {
    return this.repo.getCategories(query);
  }

  async getCategoryById(id: string) {
    return this.repo.getCategoryById(id);
  }

  async createCategory(body: CreateDocumentCategoryBody) {
    return this.repo.createCategory(body);
  }

  async updateCategory(id: string, body: UpdateDocumentCategoryBody) {
    return this.repo.updateCategory(id, body);
  }

  async deleteCategory(id: string) {
    return this.repo.deleteCategory(id);
  }
}


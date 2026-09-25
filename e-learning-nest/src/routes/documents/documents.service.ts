import { Injectable } from '@nestjs/common';
import { DocumentsRepository } from './documents.repo';
import {
  GetDocumentsQuery,
  CreateDocumentBody,
  UpdateDocumentBody,
} from './documents.model';

@Injectable()
export class DocumentsService {
  constructor(private readonly repo: DocumentsRepository) {}

  // Public endpoints
  async getDocuments(query: GetDocumentsQuery, userId?: string) {
    return this.repo.getDocuments(query, userId);
  }

  async getDocumentById(id: string, userId?: string, incrementView = true) {
    return this.repo.getDocumentById(id, userId, incrementView);
  }

  async getTrendingDocuments(limit = 10, userId?: string) {
    return this.repo.getTrendingDocuments(limit, userId);
  }

  async getTopContributors(limit = 10) {
    return this.repo.getTopContributors(limit);
  }

  // Authenticated endpoints
  async createDocument(body: CreateDocumentBody, userId: string) {
    return this.repo.createDocument(body, userId);
  }

  async updateDocument(id: string, body: UpdateDocumentBody, userId: string) {
    return this.repo.updateDocument(id, body, userId);
  }

  async deleteDocument(id: string, userId: string) {
    return this.repo.deleteDocument(id, userId);
  }

  async toggleLike(documentId: string, userId: string) {
    return this.repo.toggleLike(documentId, userId);
  }

  async trackDownload(documentId: string, userId?: string, ipAddress?: string) {
    return this.repo.trackDownload(documentId, userId, ipAddress);
  }

  async getMyDocuments(userId: string, query: GetDocumentsQuery) {
    return this.repo.getMyDocuments(userId, query);
  }

  async getMyLikedDocuments(userId: string, page = 1, limit = 20) {
    return this.repo.getMyLikedDocuments(userId, page, limit);
  }

  // Admin endpoints
  async getAdminDocuments(query: GetDocumentsQuery) {
    return this.repo.getAdminDocuments(query);
  }

  async toggleVerified(documentId: string, isVerified: boolean) {
    return this.repo.toggleVerified(documentId, isVerified);
  }

  async adminDeleteDocument(id: string) {
    return this.repo.adminDeleteDocument(id);
  }
}


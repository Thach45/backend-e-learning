import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DocumentTagsRepo } from './document-tags.repo';
import type { 
  GetDocumentTagsQuery, 
  CreateDocumentTagBody, 
  UpdateDocumentTagBody,
  GetDocumentTagsResponse,
  DocumentTagResponse,
} from './document-tags.model';

@Injectable()
export class DocumentTagsService {
  constructor(private readonly repo: DocumentTagsRepo) {}

  async findAll(query: GetDocumentTagsQuery): Promise<GetDocumentTagsResponse> {
    return this.repo.findAll(query);
  }

  async findTrending(limit = 10): Promise<{ data: DocumentTagResponse[] }> {
    const tags = await this.repo.findTrending(limit);
    return { data: tags };
  }

  async findById(id: string): Promise<DocumentTagResponse> {
    const tag = await this.repo.findById(id);
    if (!tag) {
      throw new NotFoundException('Document tag not found');
    }
    return tag;
  }

  async create(body: CreateDocumentTagBody): Promise<DocumentTagResponse> {
    // Check if name already exists
    const nameExists = await this.repo.checkNameExists(body.name);
    if (nameExists) {
      throw new ConflictException('Tag name already exists');
    }

    // Check if slug already exists (if provided)
    if (body.slug) {
      const slugExists = await this.repo.checkSlugExists(body.slug);
      if (slugExists) {
        throw new ConflictException('Tag slug already exists');
      }
    }

    return this.repo.create(body);
  }

  async update(id: string, body: UpdateDocumentTagBody): Promise<DocumentTagResponse> {
    // Check if tag exists
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('Document tag not found');
    }

    // Check if name already exists (if updating name)
    if (body.name) {
      const nameExists = await this.repo.checkNameExists(body.name, id);
      if (nameExists) {
        throw new ConflictException('Tag name already exists');
      }
    }

    // Check if slug already exists (if updating slug)
    if (body.slug) {
      const slugExists = await this.repo.checkSlugExists(body.slug, id);
      if (slugExists) {
        throw new ConflictException('Tag slug already exists');
      }
    }

    return this.repo.update(id, body);
  }

  async delete(id: string): Promise<{ message: string }> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('Document tag not found');
    }

    await this.repo.delete(id);
    return { message: 'Document tag deleted successfully' };
  }
}


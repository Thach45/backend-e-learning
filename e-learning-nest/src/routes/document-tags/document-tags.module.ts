import { Module } from '@nestjs/common';
import { DocumentTagsController } from './document-tags.controller';
import { DocumentTagsService } from './document-tags.service';
import { DocumentTagsRepo } from './document-tags.repo';

@Module({
  controllers: [DocumentTagsController],
  providers: [DocumentTagsService, DocumentTagsRepo],
  exports: [DocumentTagsService, DocumentTagsRepo],
})
export class DocumentTagsModule {}


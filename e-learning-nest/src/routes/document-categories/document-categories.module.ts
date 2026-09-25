import { Module } from '@nestjs/common';
import { DocumentCategoriesController } from './document-categories.controller';
import { DocumentCategoriesService } from './document-categories.service';
import { DocumentCategoriesRepository } from './document-categories.repo';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [DocumentCategoriesController],
  providers: [DocumentCategoriesService, DocumentCategoriesRepository],
  exports: [DocumentCategoriesService],
})
export class DocumentCategoriesModule {}

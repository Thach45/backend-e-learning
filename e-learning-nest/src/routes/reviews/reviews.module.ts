import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './reviews.repo';
import { SharedModule } from 'src/shared/shared.module';
import { GamificationModule } from 'src/routes/gamification/gamification.module';

@Module({
  imports: [SharedModule, GamificationModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}


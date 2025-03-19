import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './providers/review.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewsModule {}

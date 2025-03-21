import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './providers/review.service';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewsModule {}

import { Module } from '@nestjs/common';
import { MentorController } from './mentor.controller';
import { MentorService } from './providers/mentor.service';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [MentorController],
  providers: [MentorService],
  exports: [MentorService],
})
export class MentorsModule {}

import { Module } from '@nestjs/common';
import { MenteeController } from './mentee.controller';
import { MenteeService } from './providers/mentee.service';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [MenteeController],
  providers: [MenteeService],
  exports: [MenteeService],
})
export class MenteesModule {}

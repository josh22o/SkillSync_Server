import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './providers/session.service';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionsModule {}

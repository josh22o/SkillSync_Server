import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { SessionService } from './providers/session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  providers: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}

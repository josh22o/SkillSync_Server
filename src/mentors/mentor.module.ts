import { Module } from '@nestjs/common';
import { MentorController } from './mentor.controller';
import { MentorService } from './providers/mentor.service';

@Module({
  controllers: [MentorController],
  providers: [MentorService],
})
export class MentorsModule {}

import { Module } from '@nestjs/common';
import { MenteeController } from './mentee.controller';
import { MenteeService } from './providers/mentee.service';

@Module({
  controllers: [MenteeController],
  providers: [MenteeService],
})
export class MenteesModule {}

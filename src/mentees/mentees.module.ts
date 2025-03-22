import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentee } from './mentee.entity';
import { MenteeService } from './providers/mentee.service';
import { MenteeController } from './mentee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mentee])],
  providers: [MenteeService],
  controllers: [MenteeController],
})
export class MenteeModule {}

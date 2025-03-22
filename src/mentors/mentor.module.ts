import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentor } from './mentor.entity';
import { MentorService } from './providers/mentor.service';
import { MentorController } from './mentor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mentor])],
  providers: [MentorService],
  controllers: [MentorController],
})
export class MentorModule {}

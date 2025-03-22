import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mentor } from '../mentor.entity';
import { CreateMentorDto } from '../dto/createMentor.dto';
import { UpdateMentorDto } from '../dto/update-Mentor.dto';

@Injectable()
export class MentorService {
  constructor(
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
  ) {}

  async create(createMentorDto: CreateMentorDto): Promise<Mentor> {
    const mentor = this.mentorRepository.create(createMentorDto);
    return await this.mentorRepository.save(mentor);
  }

  async findAll(): Promise<Mentor[]> {
    return await this.mentorRepository.find();
  }

  async findOne(id: number): Promise<Mentor> {
    const mentor = await this.mentorRepository.findOne({ where: { id } });
    if (!mentor) {
      throw new NotFoundException(`Mentor with id ${id} not found`);
    }
    return mentor;
  }

  async update(id: number, updateMentorDto: UpdateMentorDto): Promise<Mentor> {
    const mentor = await this.mentorRepository.preload({
      id,
      ...updateMentorDto,
    });
    if (!mentor) {
      throw new NotFoundException(`Mentor with id ${id} not found`);
    }
    return await this.mentorRepository.save(mentor);
  }

  async remove(id: number): Promise<void> {
    const result = await this.mentorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Mentor with id ${id} not found`);
    }
  }
}

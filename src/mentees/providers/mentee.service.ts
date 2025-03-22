import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mentee } from '../mentee.entity';
import { CreateMenteeDto } from '../dto/createMentee.dto';
import { UpdateMenteeDto } from '../dto/updateMentee.dto';

@Injectable()
export class MenteeService {
  constructor(
    @InjectRepository(Mentee)
    private menteeRepository: Repository<Mentee>,
  ) {}

  async create(createMenteeDto: CreateMenteeDto): Promise<Mentee> {
    const mentee = this.menteeRepository.create(createMenteeDto);
    return await this.menteeRepository.save(mentee);
  }

  async findAll(): Promise<Mentee[]> {
    return await this.menteeRepository.find();
  }

  async findOne(id: number): Promise<Mentee> {
    const mentee = await this.menteeRepository.findOne({ where: { id } });
    if (!mentee) {
      throw new NotFoundException(`Mentee with id ${id} not found`);
    }
    return mentee;
  }

  async update(id: number, updateMenteeDto: UpdateMenteeDto): Promise<Mentee> {
    const mentee = await this.menteeRepository.preload({
      id,
      ...updateMenteeDto,
    });
    if (!mentee) {
      throw new NotFoundException(`Mentee with id ${id} not found`);
    }
    return await this.menteeRepository.save(mentee);
  }

  async remove(id: number): Promise<void> {
    const result = await this.menteeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Mentee with id ${id} not found`);
    }
  }
}

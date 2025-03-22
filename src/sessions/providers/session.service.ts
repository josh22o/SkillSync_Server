import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../session.entity';
import { CreateSessionDto } from '../dto/createSession.dto';
import { UpdateSessionDto } from '../dto/updateSession.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const session = this.sessionRepository.create(createSessionDto);
    return await this.sessionRepository.save(session);
  }

  async findAll(): Promise<Session[]> {
    return await this.sessionRepository.find();
  }

  async findOne(id: number): Promise<Session> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }
    return session;
  }

  async update(id: number, updateSessionDto: UpdateSessionDto): Promise<Session> {
    const session = await this.sessionRepository.preload({
      id,
      ...updateSessionDto,
    });
    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }
    return await this.sessionRepository.save(session);
  }

  async remove(id: number): Promise<void> {
    const result = await this.sessionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }
  }
}

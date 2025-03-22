import { Injectable } from '@nestjs/common';
import { CreateMenteeDto } from '../dto/createMentee.dto';
import { UpdateMenteeDto } from '../dto/updateMentee.dto';
import { Mentee } from '../mentee.entity';
import { RedisService } from 'src/common/redis/cache.service';

@Injectable()
export class MenteeService {
  private mentees: Mentee[] = [];
  private idCounter = 1;

  constructor(private readonly redisService: RedisService) {}

  async create(createMenteeDto: CreateMenteeDto): Promise<Mentee> {
    const newMentee: Mentee = { id: this.idCounter++, ...createMenteeDto };
    this.mentees.push(newMentee);

    // Cache the new mentee
    await this.redisService.set(`mentee:${newMentee.id}`, newMentee, 1800); // 30 minutes TTL

    // Invalidate the mentees list cache
    await this.redisService.delete('mentees:all');

    return newMentee;
  }

  async findAll(): Promise<Mentee[]> {
    // Try to get from cache first
    const cachedMentees = await this.redisService.get<Mentee[]>('mentees:all');
    if (cachedMentees) {
      return cachedMentees;
    }

    // If not in cache, store in cache (15 minutes TTL)
    await this.redisService.set('mentees:all', this.mentees, 900);

    return this.mentees;
  }

  async findMenteesByInterest(interestId: string): Promise<Mentee[]> {
    // Try to get mentees by interest from cache
    const cacheKey = `mentees:interest:${interestId}`;
    const cachedMentees = await this.redisService.get<Mentee[]>(cacheKey);
    if (cachedMentees) {
      return cachedMentees;
    }

    // If not in cache, filter mentees with this interest
    // Assuming mentees have an interests array that contains interest IDs
    const filteredMentees = this.mentees.filter(
      (mentee) => mentee.interest && mentee.interest.includes(interestId),
    );

    // Cache the filtered mentees (15 minutes TTL)
    await this.redisService.set(cacheKey, filteredMentees, 900);

    return filteredMentees;
  }

  async findOne(id: number): Promise<Mentee> {
    // Try to get from cache first
    const cachedMentee = await this.redisService.get<Mentee>(`mentee:${id}`);
    if (cachedMentee) {
      return cachedMentee;
    }

    // If not in cache, get from in-memory storage
    const mentee = this.mentees.find((mentee) => mentee.id === id);

    // Cache the result if found (30 minutes TTL)
    if (mentee) {
      await this.redisService.set(`mentee:${id}`, mentee, 1800);
    }

    return mentee;
  }

  async update(id: number, updateMenteeDto: UpdateMenteeDto): Promise<Mentee> {
    const index = this.mentees.findIndex((mentee) => mentee.id === id);
    if (index < 0) return null;

    // Store the old interests before update to invalidate interest-based caches
    const oldInterests = this.mentees[index].interest || [];

    this.mentees[index] = { ...this.mentees[index], ...updateMenteeDto };

    // Update cache with new data
    await this.redisService.set(`mentee:${id}`, this.mentees[index], 1800);

    // Invalidate the mentees list cache
    await this.redisService.delete('mentees:all');

    // Invalidate interest-based caches
    if (oldInterests.length > 0) {
      for (const interestId of oldInterests) {
        await this.redisService.delete(`mentees:interest:${interestId}`);
      }
    }

    // If new interests are provided, invalidate those caches too
    if (updateMenteeDto.interest && updateMenteeDto.interest.length > 0) {
      for (const interestId of updateMenteeDto.interest) {
        await this.redisService.delete(`mentees:interest:${interestId}`);
      }
    }

    return this.mentees[index];
  }

  async remove(id: number): Promise<boolean> {
    // Find the mentee first to get its interests
    const mentee = this.mentees.find((mentee) => mentee.id === id);
    const interests = mentee?.interest || [];

    const initialLength = this.mentees.length;
    this.mentees = this.mentees.filter((mentee) => mentee.id !== id);

    // Delete from cache
    await this.redisService.delete(`mentee:${id}`);

    // Invalidate the mentees list cache
    await this.redisService.delete('mentees:all');

    // Invalidate interest-based caches
    if (interests.length > 0) {
      for (const interestId of interests) {
        await this.redisService.delete(`mentees:interest:${interestId}`);
      }
    }

    return this.mentees.length < initialLength;
  }
}

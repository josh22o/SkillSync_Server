import { Injectable } from '@nestjs/common';
import { CreateMentorDto } from '../dto/createUser.dto';
import { UpdateMentorDto } from '../dto/update-user.dto';
import { Mentor } from '../mentor.entity';
import { RedisService } from 'src/common/redis/cache.service';

@Injectable()
export class MentorService {
  private mentors: Mentor[] = [];
  private idCounter = 1;

  constructor(private readonly redisService: RedisService) {}

  async create(createMentorDto: CreateMentorDto): Promise<Mentor> {
    const newMentor: Mentor = { id: this.idCounter++, ...createMentorDto };
    this.mentors.push(newMentor);

    // Cache the new mentor
    await this.redisService.set(`mentor:${newMentor.id}`, newMentor, 1800); // 30 minutes TTL

    // Invalidate the mentors list cache
    await this.redisService.delete('mentors:all');

    return newMentor;
  }

  async findAll(): Promise<Mentor[]> {
    // Try to get from cache first
    const cachedMentors = await this.redisService.get<Mentor[]>('mentors:all');
    if (cachedMentors) {
      return cachedMentors;
    }

    // If not in cache, store in cache (15 minutes TTL)
    await this.redisService.set('mentors:all', this.mentors, 900);

    return this.mentors;
  }

  async findMentorsBySkill(skillId: string): Promise<Mentor[]> {
    // Try to get mentors by skill from cache
    const cacheKey = `mentors:skill:${skillId}`;
    const cachedMentors = await this.redisService.get<Mentor[]>(cacheKey);
    if (cachedMentors) {
      return cachedMentors;
    }

    // If not in cache, filter mentors with this skill
    // Assuming mentors have a skills array that contains skill IDs
    const filteredMentors = this.mentors.filter(
      (mentor) => mentor.expertise && mentor.expertise.includes(skillId),
    );

    // Cache the filtered mentors (15 minutes TTL)
    await this.redisService.set(cacheKey, filteredMentors, 900);

    return filteredMentors;
  }

  async findOne(id: number): Promise<Mentor> {
    // Try to get from cache first
    const cachedMentor = await this.redisService.get<Mentor>(`mentor:${id}`);
    if (cachedMentor) {
      return cachedMentor;
    }

    // If not in cache, get from in-memory storage
    const mentor = this.mentors.find((mentor) => mentor.id === id);

    // Cache the result if found (30 minutes TTL)
    if (mentor) {
      await this.redisService.set(`mentor:${id}`, mentor, 1800);
    }

    return mentor;
  }

  async update(id: number, updateMentorDto: UpdateMentorDto): Promise<Mentor> {
    const index = this.mentors.findIndex((mentor) => mentor.id === id);
    if (index < 0) return null;

    // Store the old skills before update to invalidate skill-based caches
    const oldSkills = this.mentors[index].expertise || [];

    this.mentors[index] = { ...this.mentors[index], ...updateMentorDto };

    // Update cache with new data
    await this.redisService.set(`mentor:${id}`, this.mentors[index], 1800);

    // Invalidate the mentors list cache
    await this.redisService.delete('mentors:all');

    // Invalidate skill-based caches
    if (oldSkills.length > 0) {
      for (const skillId of oldSkills) {
        await this.redisService.delete(`mentors:skill:${skillId}`);
      }
    }

    // If new skills are provided, invalidate those caches too
    if (updateMentorDto.expertise && updateMentorDto.expertise.length > 0) {
      for (const skillId of updateMentorDto.expertise) {
        await this.redisService.delete(`mentors:skill:${skillId}`);
      }
    }

    return this.mentors[index];
  }

  async remove(id: number): Promise<boolean> {
    // Find the mentor first to get its skills
    const mentor = this.mentors.find((mentor) => mentor.id === id);
    const skills = mentor?.expertise || [];

    const initialLength = this.mentors.length;
    this.mentors = this.mentors.filter((mentor) => mentor.id !== id);

    // Delete from cache
    await this.redisService.delete(`mentor:${id}`);

    // Invalidate the mentors list cache
    await this.redisService.delete('mentors:all');

    // Invalidate skill-based caches
    if (skills.length > 0) {
      for (const skillId of skills) {
        await this.redisService.delete(`mentors:skill:${skillId}`);
      }
    }

    return this.mentors.length < initialLength;
  }
}

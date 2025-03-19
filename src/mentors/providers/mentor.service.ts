import { Injectable } from '@nestjs/common';
import { CreateMentorDto } from '../dto/createUser.dto';
import { UpdateMentorDto } from '../dto/update-user.dto';
import { Mentor } from '../mentor.entity';

@Injectable()
export class MentorService {
  private mentors: Mentor[] = [];
  private idCounter = 1;

  create(createMentorDto: CreateMentorDto): Mentor {
    const newMentor: Mentor = { id: this.idCounter++, ...createMentorDto };
    this.mentors.push(newMentor);
    return newMentor;
  }

  findAll(): Mentor[] {
    return this.mentors;
  }

  findOne(id: number): Mentor {
    return this.mentors.find(mentor => mentor.id === id);
  }

  update(id: number, updateMentorDto: UpdateMentorDto): Mentor {
    const index = this.mentors.findIndex(mentor => mentor.id === id);
    if (index < 0) return null;
    this.mentors[index] = { ...this.mentors[index], ...updateMentorDto };
    return this.mentors[index];
  }

  remove(id: number): boolean {
    const initialLength = this.mentors.length;
    this.mentors = this.mentors.filter(mentor => mentor.id !== id);
    return this.mentors.length < initialLength;
  }
}

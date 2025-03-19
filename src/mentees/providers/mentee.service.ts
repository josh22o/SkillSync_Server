import { Injectable } from '@nestjs/common';
import { CreateMenteeDto } from '../dto/createMentee.dto';
import { UpdateMenteeDto } from '../dto/updateMentee.dto';
import { Mentee } from '../mentee.entity';

@Injectable()
export class MenteeService {
  private mentees: Mentee[] = [];
  private idCounter = 1;

  create(createMenteeDto: CreateMenteeDto): Mentee {
    const newMentee: Mentee = { id: this.idCounter++, ...createMenteeDto };
    this.mentees.push(newMentee);
    return newMentee;
  }

  findAll(): Mentee[] {
    return this.mentees;
  }

  findOne(id: number): Mentee {
    return this.mentees.find(mentee => mentee.id === id);
  }

  update(id: number, updateMenteeDto: UpdateMenteeDto): Mentee {
    const index = this.mentees.findIndex(mentee => mentee.id === id);
    if (index < 0) return null;
    this.mentees[index] = { ...this.mentees[index], ...updateMenteeDto };
    return this.mentees[index];
  }

  remove(id: number): boolean {
    const initialLength = this.mentees.length;
    this.mentees = this.mentees.filter(mentee => mentee.id !== id);
    return this.mentees.length < initialLength;
  }
}

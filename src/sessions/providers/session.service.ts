import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from '../dto/createSession.dto';
import { UpdateSessionDto } from '../dto/updateSession.dto';
import { Session } from '../session.entity';

@Injectable()
export class SessionService {
  private sessions: Session[] = [];
  private idCounter = 1;

  create(createSessionDto: CreateSessionDto): Session {
    const newSession: Session = { id: this.idCounter++, ...createSessionDto };
    this.sessions.push(newSession);
    return newSession;
  }

  findAll(): Session[] {
    return this.sessions;
  }

  findOne(id: number): Session {
    return this.sessions.find(session => session.id === id);
  }

  update(id: number, updateSessionDto: UpdateSessionDto): Session {
    const index = this.sessions.findIndex(session => session.id === id);
    if (index < 0) return null;
    this.sessions[index] = { ...this.sessions[index], ...updateSessionDto };
    return this.sessions[index];
  }

  remove(id: number): boolean {
    const initialLength = this.sessions.length;
    this.sessions = this.sessions.filter(session => session.id !== id);
    return this.sessions.length < initialLength;
  }
}

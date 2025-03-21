// src/auth/entities/refresh-token.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @ManyToOne(() => User, user => user.refreshTokens)
  user: User;

  @Column({ default: false })
  isInvalidated: boolean;

  @Column({ type: 'timestamp' })
  expires: Date;
}

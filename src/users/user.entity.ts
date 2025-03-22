import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // Using UUIDs for better scalability
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true }) // Ensuring email is unique
  email: string;

  @Column()
  password: string; // Including password

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
  })
  refreshTokens: RefreshToken[];
}

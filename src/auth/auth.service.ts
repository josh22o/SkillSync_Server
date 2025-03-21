// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshTokenString = this.jwtService.sign(payload, { expiresIn: '7d' });

    const refreshToken = this.refreshTokenRepository.create({
      token: refreshTokenString,
      user,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepository.save(refreshToken);

    return { accessToken, refreshToken: refreshTokenString };
  }

  async logout(refreshToken: string): Promise<boolean> {
    const tokenRecord = await this.refreshTokenRepository.findOne({ where: { token: refreshToken } });
    if (!tokenRecord) return false;
    
    tokenRecord.isInvalidated = true;
    await this.refreshTokenRepository.save(tokenRecord);
    return true;
  }

  async findRefreshToken(token: string): Promise<RefreshToken> {
    return this.refreshTokenRepository.findOne({ where: { token } });
  }

  async createNewRefreshToken(user: User, token: string): Promise<RefreshToken> {
    const newToken = this.refreshTokenRepository.create({
      token,
      user,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return this.refreshTokenRepository.save(newToken);
  }
}

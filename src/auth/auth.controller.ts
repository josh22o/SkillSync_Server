// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    const result = await this.authService.logout(refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid token');
    }
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    let payload;
    try {
      payload = this.authService['jwtService'].verify(refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenRecord = await this.authService.findRefreshToken(refreshToken);
    if (!tokenRecord || tokenRecord.isInvalidated || tokenRecord.expires < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const newAccessToken = this.authService['jwtService'].sign({ username: payload.username, sub: payload.sub }, { expiresIn: '15m' });
    const newRefreshToken = this.authService['jwtService'].sign({ username: payload.username, sub: payload.sub }, { expiresIn: '7d' });
    tokenRecord.isInvalidated = true;
    await this.authService.createNewRefreshToken(tokenRecord.user, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

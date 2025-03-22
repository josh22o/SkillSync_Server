// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponse } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'User registered successfully', userId: user.id };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

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
    if (
      !tokenRecord ||
      tokenRecord.isInvalidated ||
      tokenRecord.expires < new Date()
    ) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const newAccessToken = this.authService['jwtService'].sign(
      { username: payload.username, sub: payload.sub },
      { expiresIn: '15m' },
    );
    const newRefreshToken = this.authService['jwtService'].sign(
      { username: payload.username, sub: payload.sub },
      { expiresIn: '7d' },
    );
    tokenRecord.isInvalidated = true;
    await this.authService.createNewRefreshToken(
      tokenRecord.user,
      newRefreshToken,
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity.js';
import { AuthService } from './auth.service.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Response } from 'express';
import { AuthGuard } from './auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<User | { message: string }> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
    };

    res
      .cookie('access_token', accessToken, {
        ...cookieOptions,
        maxAge: 3600 * 1000, // 1 час
      })
      .cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 3600 * 1000, // 7 дней
      })
      .status(HttpStatus.OK);

    return { message: 'Login successful' };
  }

  @UseGuards(AuthGuard)
  @Post('refresh-tokens')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const user = req['user'];

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(user);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Для HTTPS
      sameSite: 'strict' as const,
    };

    res
      .cookie('access_token', accessToken, {
        ...cookieOptions,
        maxAge: 3600 * 1000, // 1 час
      })
      .cookie('refresh_token', newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 3600 * 1000, // 7 дней
      })
      .status(HttpStatus.OK);

    return { message: 'Tokens refreshed' };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = req['user'];

    await this.authService.logout(user.sub);
    res
      .clearCookie('access_token')
      .clearCookie('refresh_token')
      .status(HttpStatus.OK);

    return { message: 'Logged out successfully' };
  }
}

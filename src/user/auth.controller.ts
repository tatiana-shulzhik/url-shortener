import { Controller, Post, Body } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import { AuthService } from './auth.service.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { LoginDto } from './dto/login.dto.js';

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
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginDto);
  }
}

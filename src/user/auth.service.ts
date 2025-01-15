import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<User | { message: string }> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: registerUserDto.email },
      });

      if (existingUser) {
        this.logger.error('User registration failed', {
          error: 'Email already exists',
          email: registerUserDto.email,
        });
        return { message: 'Email already exists' };
      }

      const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
      const user = this.userRepository.create({
        firstName: registerUserDto.firstName,
        lastName: registerUserDto.lastName,
        email: registerUserDto.email,
        password: hashedPassword,
      });

      return this.userRepository.save(user);
    } catch (err) {
      this.logger.error(err);
      return err;
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    try {
      const { email, password } = loginDto;
      const user = await this.findUserByEmail(email);

      if (user && (await bcrypt.compare(password, user.password))) {
        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
      }

      throw new Error('Invalid credentials');
    } catch (err) {
      this.logger.error(err);
      return err;
    }
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { SessionService } from 'src/session/session.service';
import { RefreshTokenPayloadDto } from './dto/refresh-token-payload.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
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

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    const session = await this.sessionService.updateSession(user.id);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email: user.email, sub: user.id, session: session.id };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return { accessToken, refreshToken };
    }

    throw new Error('Invalid credentials');
  }

  async refreshTokens(
    decodedPayload: RefreshTokenPayloadDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { sub } = decodedPayload;
    const user = await this.userRepository.findOne({ where: { id: sub } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newPayload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(newPayload, { expiresIn: '1h' });
    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '7d',
    });

    await this.sessionService.updateSession(user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.sessionService.deleteSession(userId);
  }

  async findUserById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createSession(userId: string): Promise<Session> {
    const session = this.sessionRepository.create({ user: { id: userId } });
    return await this.sessionRepository.save(session);
  }

  async updateSession(userId: string) {
    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId } },
    });
    if (session) {
      return this.sessionRepository.save(session);
    } else {
      await this.createSession(userId);
    }
  }

  async deleteSession(userId: string): Promise<void> {
    await this.sessionRepository.delete({ user: { id: userId } });
  }

  async findSessionByUserId(userId: string): Promise<Session | null> {
    return this.sessionRepository.findOne({ where: { user: { id: userId } } });
  }
}

import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { ShortLink } from './entities/short-link.entity';
import { CreateShortLinkDto } from './dto/create-short-link.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ShortenerService {
  constructor(
    @InjectRepository(ShortLink)
    private readonly shortLinkRepository: Repository<ShortLink>,
    private readonly authService: AuthService,
  ) {}

  async createShortLink(
    dto: CreateShortLinkDto,
    userId: string,
  ): Promise<ShortLink> {
    const shortUrl = nanoid(6);
    const shortLink = this.shortLinkRepository.create({
      ...dto,
      shortUrl,
      user: { id: userId },
    });
    return this.shortLinkRepository.save(shortLink);
  }

  async getOriginalUrl(shortUrl: string): Promise<string> {
    const shortLink = await this.shortLinkRepository.findOne({
      where: { shortUrl },
    });

    if (
      !shortLink ||
      (shortLink.expiresAt && new Date() > shortLink.expiresAt)
    ) {
      throw new NotFoundException('Short URL not found or expired');
    }

    shortLink.clickCount += 1;
    await this.shortLinkRepository.save(shortLink);
    return shortLink.originalUrl;
  }

  async getShortLinkInfo(shortUrl: string, userId: string): Promise<ShortLink> {
    const shortLink = await this.shortLinkRepository.findOne({
      where: { shortUrl },
    });

    const user = await this.authService.findUserById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!shortLink) {
      throw new NotFoundException('Short URL not found');
    }

    if (shortLink.expiresAt && new Date() > shortLink.expiresAt) {
      throw new GoneException('Short URL has expired');
    }

    return shortLink;
  }

  async deleteShortLink(
    shortUrl: string,
    userId: string,
  ): Promise<{ message: string }> {
    const user = await this.authService.findUserById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const result = await this.shortLinkRepository.softDelete({ shortUrl });

    if (!result) {
      throw new NotFoundException('Short URL not found');
    }

    return { message: 'Short URL deleted successfully' };
  }
}

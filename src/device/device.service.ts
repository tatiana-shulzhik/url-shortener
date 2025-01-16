import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UAParser } from 'ua-parser-js';
import { Device } from './entities/device.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';

@Injectable()
export class DeviceService {
  private parser: UAParser;

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {
    this.parser = new UAParser();
  }

  async parseUserAgent(
    userAgent: string,
    request: Request,
    shortLinkId: string,
  ): Promise<Device> {
    this.parser.setUA(userAgent);
    const deviceInfo = this.parser.getResult();
    const ipAddress = request.ip;

    await this.deviceRepository.save({
      shortLink: { id: shortLinkId },
      deviceType: deviceInfo.device.type,
      deviceName: deviceInfo.device.model,
      ipAddress,
      osName: deviceInfo.os.name,
      osVersion: deviceInfo.os.version,
    });

    return deviceInfo;
  }

  async getAnalytics(shortUrl: string) {
    const device = await this.deviceRepository.findOne({
      where: { shortLink: { shortUrl } },
    });

    if (!device) {
      throw new NotFoundException('Short URL not found');
    }

    const clickCount = await this.deviceRepository.count({
      where: { shortLink: { shortUrl } },
    });

    const recentIps = await this.deviceRepository.find({
      where: { shortLink: { shortUrl } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return { clickCount, recentIps: recentIps.map((ip) => ip.ipAddress) };
  }
}

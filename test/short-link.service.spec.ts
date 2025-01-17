import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShortenerService } from '../src/shortener/shortener.service';
import { DeviceService } from '../src/device/device.service';
import { AuthService } from '../src/auth/auth.service';

describe('ShortenerService', () => {
  let service: ShortenerService;
  let mockShortLinkRepository: any;
  let mockDeviceService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockShortLinkRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockDeviceService = {
      parseUserAgent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerService,
        { provide: 'ShortLinkRepository', useValue: mockShortLinkRepository },
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен вернуть оригинальный URL, если короткий URL существует и не истек', async () => {
    const shortUrl = 'short-url';
    const userAgent = 'Mozilla/5.0';
    const request = {} as any;
    const shortLink = {
      id: 1,
      shortUrl,
      originalUrl: 'http://example.com',
      expiresAt: null,
      clickCount: 0,
    };

    mockShortLinkRepository.findOne.mockResolvedValue(shortLink);
    mockDeviceService.parseUserAgent.mockResolvedValue(undefined);
    mockShortLinkRepository.save.mockResolvedValue(shortLink);

    const result = await service.getOriginalUrl(shortUrl, userAgent, request);

    expect(result).toBe('http://example.com');
    expect(shortLink.clickCount).toBe(1);
    expect(mockDeviceService.parseUserAgent).toHaveBeenCalledWith(
      userAgent,
      request,
      shortLink.id,
    );
    expect(mockShortLinkRepository.save).toHaveBeenCalledWith(shortLink);
  });

  it('должен выбросить NotFoundException, если короткий URL не существует', async () => {
    const shortUrl = 'non-existent-url';
    const userAgent = 'Mozilla/5.0';
    const request = {} as any;

    mockShortLinkRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getOriginalUrl(shortUrl, userAgent, request),
    ).rejects.toThrow(new NotFoundException('Short URL not found or expired'));
  });

  it('должен выбросить NotFoundException, если короткий URL истек', async () => {
    const shortUrl = 'expired-url';
    const userAgent = 'Mozilla/5.0';
    const request = {} as any;
    const expiredShortLink = {
      shortUrl,
      originalUrl: 'http://example.com',
      expiresAt: new Date(Date.now() - 1000),
      clickCount: 0,
    };

    mockShortLinkRepository.findOne.mockResolvedValue(expiredShortLink);

    await expect(
      service.getOriginalUrl(shortUrl, userAgent, request),
    ).rejects.toThrow(new NotFoundException('Short URL not found or expired'));
  });
});

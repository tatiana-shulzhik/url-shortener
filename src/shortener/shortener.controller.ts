import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Body,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { ShortenerService } from './shortener.service';
import { CreateShortLinkDto } from './dto/create-short-link.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('shorten')
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createShortLink(
    @Body() createShortLinkDto: CreateShortLinkDto,
    @Req() req: Request,
  ) {
    const user = req['user'];

    return await this.shortenerService.createShortLink(
      createShortLinkDto,
      user.sub,
    );
  }

  @Get('/:shortUrl')
  async redirectToOriginal(
    @Param('shortUrl') shortUrl: string,
    @Res() res: Response,
  ) {
    const originalUrl = await this.shortenerService.getOriginalUrl(shortUrl);
    return res.redirect(originalUrl);
  }

  @UseGuards(AuthGuard)
  @Get('/info/:shortUrl')
  async getShortLinkInfo(
    @Param('shortUrl') shortUrl: string,
    @Req() req: Request,
  ) {
    const user = req['user'];
    return this.shortenerService.getShortLinkInfo(shortUrl, user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete('/:shortUrl')
  async deleteShortLink(
    @Param('shortUrl') shortUrl: string,
    @Req() req: Request,
  ) {
    const user = req['user'];
    return this.shortenerService.deleteShortLink(shortUrl, user.sub);
  }
}

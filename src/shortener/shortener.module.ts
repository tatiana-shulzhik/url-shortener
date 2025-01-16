import { Module } from '@nestjs/common';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortLink } from './entities/short-link.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShortLink]), AuthModule],
  controllers: [ShortenerController],
  providers: [ShortenerService],
})
export class ShortenerModule {}

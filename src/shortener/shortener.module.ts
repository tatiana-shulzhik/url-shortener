import { Module } from '@nestjs/common';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortLink } from './entities/short-link.entity';
import { AuthModule } from 'src/auth/auth.module';
import { DeviceModule } from 'src/device/device.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShortLink]), AuthModule, DeviceModule],
  controllers: [ShortenerController],
  providers: [ShortenerService],
})
export class ShortenerModule {}

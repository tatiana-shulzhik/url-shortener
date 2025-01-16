import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { DeviceService } from './device.service';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}

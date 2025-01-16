import { IsNotEmpty, IsOptional, IsUrl, IsDateString } from 'class-validator';

export class CreateShortLinkDto {
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}

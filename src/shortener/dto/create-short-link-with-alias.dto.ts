import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateShortLinkWithAliasDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(2048, {
    message: 'Original URL length must not exceed 2048 characters',
  })
  originalUrl: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20, { message: 'Alias length must not exceed 20 characters' })
  alias: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}

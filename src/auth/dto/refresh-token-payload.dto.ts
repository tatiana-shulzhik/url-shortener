import { IsString, IsEmail, IsNumber } from 'class-validator';

export class RefreshTokenPayloadDto {
  @IsEmail()
  email: string;

  @IsString()
  sub: string;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}

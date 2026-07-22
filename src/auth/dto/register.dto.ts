import { IsEmail, IsString, MinLength, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  coupleName1: string;

  @IsString()
  coupleName2: string;

  @IsDateString()
  weddingDate: string;
}

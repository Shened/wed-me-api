import { IsString, IsOptional } from 'class-validator';

export class CreateGuestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

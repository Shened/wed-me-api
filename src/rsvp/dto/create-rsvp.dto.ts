import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRsvpDto {
  @IsBoolean()
  attending: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  companions?: number;

  @IsOptional()
  @IsString()
  dietaryNotes?: string;
}

import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRsvpDto {
  @IsBoolean()
  attending: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  companions?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  dietaryNotes?: string;
}

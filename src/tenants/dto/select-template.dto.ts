import { IsString, IsOptional } from 'class-validator';

export class SelectTemplateDto {
  @IsString()
  templateId: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  coverPhotoUrl?: string;
}

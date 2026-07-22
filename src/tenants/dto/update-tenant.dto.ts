import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  coupleName1?: string;

  @IsOptional()
  @IsString()
  coupleName2?: string;

  @IsOptional()
  @IsDateString()
  weddingDate?: string;

  @IsOptional()
  @IsString()
  ceremonyPlace?: string;

  @IsOptional()
  @IsString()
  receptionPlace?: string;

  @IsOptional()
  @IsString()
  dressCode?: string;
}

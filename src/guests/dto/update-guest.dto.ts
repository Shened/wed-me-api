import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateGuestDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\s()-]*$/, {
    message: 'Telemóvel deve conter apenas números e os símbolos + ( ) -',
  })
  phone?: string;
}

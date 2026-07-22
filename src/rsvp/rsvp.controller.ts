import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Controller('rsvp')
export class RsvpController {
  constructor(private rsvpService: RsvpService) {}

  @Get(':qrToken')
  async findByToken(@Param('qrToken') qrToken: string) {
    return this.rsvpService.findByToken(qrToken);
  }

  @Post(':qrToken')
  async submit(@Param('qrToken') qrToken: string, @Body() dto: CreateRsvpDto) {
    return this.rsvpService.submit(qrToken, dto);
  }
}

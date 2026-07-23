import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('rsvp')
export class RsvpController {
  constructor(private rsvpService: RsvpService) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } }) // Limit to 20 requests per minute
  @Get(':qrToken')
  async findByToken(@Param('qrToken') qrToken: string) {
    return this.rsvpService.findByToken(qrToken);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } }) // Limit to 10 requests per minute
  @Post(':qrToken')
  async submit(@Param('qrToken') qrToken: string, @Body() dto: CreateRsvpDto) {
    return this.rsvpService.submit(qrToken, dto);
  }
}

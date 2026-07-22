import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: string; tenantId: string };
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getHello(@Request() req: AuthenticatedRequest) {
    return { message: this.appService.getHello(), user: req.user };
  }
}

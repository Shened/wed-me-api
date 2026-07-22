import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: string; tenantId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('guests')
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateGuestDto,
  ) {
    return this.guestsService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.guestsService.findAllForTenant(req.user.tenantId);
  }

  @Get('summary')
  async summary(@Request() req: AuthenticatedRequest) {
    return this.guestsService.summary(req.user.tenantId);
  }

  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateGuestDto,
  ) {
    return this.guestsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.guestsService.remove(req.user.tenantId, id);
  }
}

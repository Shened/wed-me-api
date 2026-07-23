import {
  Body,
  Controller,
  Patch,
  Request,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SelectTemplateDto } from './dto/select-template.dto';
import { Throttle } from '@nestjs/throttler';

interface AuthenticatedRequest {
  user: { userId: string; tenantId: string };
}

@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateOwnTenant(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.updateOwnTenant(req.user.tenantId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('template')
  async selectTemplate(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SelectTemplateDto,
  ) {
    return this.tenantsService.selectTemplate(req.user.tenantId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('publish')
  async publish(@Request() req: AuthenticatedRequest) {
    return this.tenantsService.publish(req.user.tenantId);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } }) // Limit to 20 requests per minute
  @Get(':slug')
  async findPublicBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findPublicBySlug(slug);
  }
}

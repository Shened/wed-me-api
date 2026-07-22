import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { SelectTemplateDto } from './dto/select-template.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async updateOwnTenant(tenantId: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado.');
    }

    const data: Record<string, unknown> = { ...dto };
    if (dto.weddingDate) {
      data.weddingDate = new Date(dto.weddingDate);
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }

  async selectTemplate(tenantId: string, dto: SelectTemplateDto) {
    const template = await this.prisma.template.findUnique({
      where: { id: dto.templateId },
    });

    if (!template || !template.isActive) {
      throw new NotFoundException('Template não encontrado ou inativo.');
    }

    // Desativa qualquer associação anterior (mantemos histórico, não apagamos)
    await this.prisma.tenantTemplate.updateMany({
      where: { tenantId, isActive: true },
      data: { isActive: false },
    });

    return this.prisma.tenantTemplate.create({
      data: {
        tenantId,
        templateId: dto.templateId,
        primaryColor: dto.primaryColor,
        coverPhotoUrl: dto.coverPhotoUrl,
        isActive: true,
      },
    });
  }

  async publish(tenantId: string) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { isPublished: true },
    });
  }

  async findPublicBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        templates: {
          where: { isActive: true },
          include: { template: true },
        },
      },
    });

    if (!tenant || !tenant.isPublished) {
      throw new NotFoundException('Convite não encontrado.');
    }

    return tenant;
  }
}

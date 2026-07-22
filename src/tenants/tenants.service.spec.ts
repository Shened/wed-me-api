import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: {
    tenant: { findUnique: jest.Mock; update: jest.Mock };
    template: { findUnique: jest.Mock };
    tenantTemplate: { updateMany: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: PrismaService,
          useValue: {
            tenant: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            template: {
              findUnique: jest.fn(),
            },
            tenantTemplate: {
              updateMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateOwnTenant', () => {
    it('deve lançar NotFoundException se o tenant não existir', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.updateOwnTenant('tenant-inexistente', { dressCode: 'Casual' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar o tenant quando existir', async () => {
      const fakeTenant = { id: 'tenant-1', dressCode: 'Casual' };
      prisma.tenant.findUnique.mockResolvedValue(fakeTenant);
      prisma.tenant.update.mockResolvedValue({
        ...fakeTenant,
        dressCode: 'Traje de gala',
      });

      const result = await service.updateOwnTenant('tenant-1', {
        dressCode: 'Traje de gala',
      });

      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: { dressCode: 'Traje de gala' },
      });
      expect(result.dressCode).toBe('Traje de gala');
    });
  });

  describe('selectTemplate', () => {
    it('deve lançar NotFoundException se o template não existir ou estiver inativo', async () => {
      prisma.template.findUnique.mockResolvedValue(null);

      await expect(
        service.selectTemplate('tenant-1', { templateId: 'template-x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve desativar templates anteriores e criar um novo registo ativo', async () => {
      prisma.template.findUnique.mockResolvedValue({
        id: 'template-1',
        isActive: true,
      });
      prisma.tenantTemplate.updateMany.mockResolvedValue({ count: 1 });
      prisma.tenantTemplate.create.mockResolvedValue({
        id: 'tt-1',
        tenantId: 'tenant-1',
        templateId: 'template-1',
        isActive: true,
      });

      const result = await service.selectTemplate('tenant-1', {
        templateId: 'template-1',
      });

      expect(prisma.tenantTemplate.updateMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', isActive: true },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(true);
    });
  });

  describe('findPublicBySlug', () => {
    it('deve lançar NotFoundException se o tenant não existir', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.findPublicBySlug('slug-inexistente'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se o tenant existir mas não estiver publicado', async () => {
      prisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        isPublished: false,
      });

      await expect(
        service.findPublicBySlug('slug-nao-publicado'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve devolver o tenant se estiver publicado', async () => {
      const fakeTenant = {
        id: 'tenant-1',
        isPublished: true,
        slug: 'joao-silvia',
      };
      prisma.tenant.findUnique.mockResolvedValue(fakeTenant);

      const result = await service.findPublicBySlug('joao-silvia');

      expect(result).toEqual(fakeTenant);
    });
  });
});

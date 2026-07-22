import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GuestsService', () => {
  let service: GuestsService;
  let prisma: {
    guest: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestsService,
        {
          provide: PrismaService,
          useValue: {
            guest: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GuestsService>(GuestsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um convidado associado ao tenant', async () => {
      prisma.guest.create.mockResolvedValue({
        id: 'guest-1',
        tenantId: 'tenant-1',
        name: 'Ana',
      });

      const result = await service.create('tenant-1', { name: 'Ana' });

      expect(prisma.guest.create).toHaveBeenCalledWith({
        data: { tenantId: 'tenant-1', name: 'Ana', phone: undefined },
      });
      expect(result.name).toBe('Ana');
    });
  });

  describe('findAllForTenant', () => {
    it('deve listar apenas os convidados do tenant', async () => {
      prisma.guest.findMany.mockResolvedValue([{ id: 'guest-1' }]);

      const result = await service.findAllForTenant('tenant-1');

      expect(prisma.guest.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: { rsvp: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('summary', () => {
    it('deve agregar confirmados, recusados, pendentes e notas alimentares', async () => {
      prisma.guest.findMany.mockResolvedValue([
        {
          name: 'Ana',
          rsvp: { attending: true, companions: 2, dietaryNotes: 'Vegetariana' },
        },
        {
          name: 'Bruno',
          rsvp: { attending: false, companions: 0, dietaryNotes: null },
        },
        { name: 'Carlos', rsvp: null },
      ]);

      const result = await service.summary('tenant-1');

      expect(result).toEqual({
        totalGuests: 3,
        confirmed: 1,
        declined: 1,
        pending: 1,
        totalCompanions: 2,
        dietaryNotes: [{ guestName: 'Ana', dietaryNotes: 'Vegetariana' }],
      });
    });
  });

  describe('update', () => {
    it('deve lançar NotFoundException se o convidado não existir', async () => {
      prisma.guest.findUnique.mockResolvedValue(null);

      await expect(
        service.update('tenant-1', 'guest-x', { name: 'Novo Nome' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se o convidado for de outro tenant', async () => {
      prisma.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        tenantId: 'tenant-2',
      });

      await expect(
        service.update('tenant-1', 'guest-1', { name: 'Novo Nome' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar o convidado quando pertence ao tenant', async () => {
      prisma.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        tenantId: 'tenant-1',
      });
      prisma.guest.update.mockResolvedValue({
        id: 'guest-1',
        tenantId: 'tenant-1',
        name: 'Novo Nome',
      });

      const result = await service.update('tenant-1', 'guest-1', {
        name: 'Novo Nome',
      });

      expect(result.name).toBe('Novo Nome');
    });
  });

  describe('remove', () => {
    it('deve lançar NotFoundException se o convidado for de outro tenant', async () => {
      prisma.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        tenantId: 'tenant-2',
      });

      await expect(service.remove('tenant-1', 'guest-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve remover o convidado quando pertence ao tenant', async () => {
      prisma.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        tenantId: 'tenant-1',
      });
      prisma.guest.delete.mockResolvedValue({ id: 'guest-1' });

      const result = await service.remove('tenant-1', 'guest-1');

      expect(prisma.guest.delete).toHaveBeenCalledWith({
        where: { id: 'guest-1' },
      });
      expect(result.id).toBe('guest-1');
    });
  });
});

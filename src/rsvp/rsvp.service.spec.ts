import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RsvpService', () => {
  let service: RsvpService;
  let prisma: {
    guest: { findUnique: jest.Mock };
    rsvp: { upsert: jest.Mock };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RsvpService,
        {
          provide: PrismaService,
          useValue: {
            guest: { findUnique: jest.fn() },
            rsvp: { upsert: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<RsvpService>(RsvpService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByToken', () => {
    it('deve lançar NotFoundException se o qrToken não existir', async () => {
      prisma.guest.findUnique.mockResolvedValue(null);

      await expect(service.findByToken('token-x')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException se o tenant não estiver publicado', async () => {
      prisma.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        tenant: { isPublished: false },
      });

      await expect(service.findByToken('token-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve devolver o convidado se o tenant estiver publicado', async () => {
      const fakeGuest = {
        id: 'guest-1',
        tenant: { isPublished: true },
        rsvp: null,
      };
      prisma.guest.findUnique.mockResolvedValue(fakeGuest);

      const result = await service.findByToken('token-1');

      expect(result).toEqual(fakeGuest);
    });
  });

  describe('submit', () => {
    it('deve lançar NotFoundException se o qrToken não existir', async () => {
      prisma.guest.findUnique.mockResolvedValue(null);

      await expect(
        service.submit('token-x', { attending: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se o prazo (weddingDate) já passou', async () => {
      prisma.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        tenant: { isPublished: true, weddingDate: new Date('2020-01-01') },
      });

      await expect(
        service.submit('token-1', { attending: true }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir responder se não houver weddingDate definida', async () => {
      prisma.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        tenant: { isPublished: true, weddingDate: null },
      });
      prisma.rsvp.upsert.mockResolvedValue({
        guestId: 'guest-1',
        attending: true,
        companions: 0,
      });

      const result = await service.submit('token-1', { attending: true });

      expect(prisma.rsvp.upsert).toHaveBeenCalledWith({
        where: { guestId: 'guest-1' },
        update: { attending: true, companions: 0, dietaryNotes: undefined },
        create: {
          guestId: 'guest-1',
          attending: true,
          companions: 0,
          dietaryNotes: undefined,
        },
      });
      expect(result.attending).toBe(true);
    });

    it('deve permitir responder antes da weddingDate', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      prisma.guest.findUnique.mockResolvedValue({
        id: 'guest-1',
        tenant: { isPublished: true, weddingDate: futureDate },
      });
      prisma.rsvp.upsert.mockResolvedValue({
        guestId: 'guest-1',
        attending: false,
        companions: 0,
      });

      const result = await service.submit('token-1', { attending: false });

      expect(result.attending).toBe(false);
    });
  });
});

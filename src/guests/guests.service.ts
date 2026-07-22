import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateGuestDto) {
    return this.prisma.guest.create({
      data: {
        tenantId,
        name: dto.name,
        phone: dto.phone,
      },
    });
  }

  async findAllForTenant(tenantId: string) {
    return this.prisma.guest.findMany({
      where: { tenantId },
      include: { rsvp: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async summary(tenantId: string) {
    const guests = await this.prisma.guest.findMany({
      where: { tenantId },
      include: { rsvp: true },
    });

    const confirmed = guests.filter((g) => g.rsvp?.attending === true);
    const declined = guests.filter((g) => g.rsvp?.attending === false);
    const pending = guests.filter((g) => !g.rsvp);

    const totalCompanions = confirmed.reduce(
      (sum, g) => sum + (g.rsvp?.companions ?? 0),
      0,
    );

    const dietaryNotes = guests
      .filter((g) => g.rsvp?.dietaryNotes)
      .map((g) => ({ guestName: g.name, dietaryNotes: g.rsvp!.dietaryNotes }));

    return {
      totalGuests: guests.length,
      confirmed: confirmed.length,
      declined: declined.length,
      pending: pending.length,
      totalCompanions,
      dietaryNotes,
    };
  }

  private async findOwnedGuest(tenantId: string, guestId: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest || guest.tenantId !== tenantId) {
      throw new NotFoundException('Convidado não encontrado.');
    }

    return guest;
  }

  async update(tenantId: string, guestId: string, dto: UpdateGuestDto) {
    await this.findOwnedGuest(tenantId, guestId);

    return this.prisma.guest.update({
      where: { id: guestId },
      data: dto,
    });
  }

  async remove(tenantId: string, guestId: string) {
    await this.findOwnedGuest(tenantId, guestId);

    return this.prisma.guest.delete({
      where: { id: guestId },
    });
  }
}

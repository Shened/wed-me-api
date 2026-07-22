import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(private prisma: PrismaService) {}

  private async findPublishedGuestByToken(qrToken: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { qrToken },
      include: { tenant: true, rsvp: true },
    });

    if (!guest || !guest.tenant.isPublished) {
      throw new NotFoundException('Convite não encontrado.');
    }

    return guest;
  }

  async findByToken(qrToken: string) {
    return this.findPublishedGuestByToken(qrToken);
  }

  async submit(qrToken: string, dto: CreateRsvpDto) {
    const guest = await this.findPublishedGuestByToken(qrToken);

    if (guest.tenant.weddingDate && new Date() > guest.tenant.weddingDate) {
      throw new ForbiddenException(
        'O prazo para responder a este convite já terminou.',
      );
    }

    return this.prisma.rsvp.upsert({
      where: { guestId: guest.id },
      update: {
        attending: dto.attending,
        companions: dto.companions ?? 0,
        dietaryNotes: dto.dietaryNotes,
      },
      create: {
        guestId: guest.id,
        attending: dto.attending,
        companions: dto.companions ?? 0,
        dietaryNotes: dto.dietaryNotes,
      },
    });
  }
}

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = { sub: user.id, tenantId: user.tenantId };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já registado.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const weddingDate = new Date(dto.weddingDate);
    const slug = await this.generateUniqueSlug(
      dto.coupleName1,
      dto.coupleName2,
      weddingDate,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug,
          coupleName1: dto.coupleName1,
          coupleName2: dto.coupleName2,
          weddingDate,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });

    return {
      tenantId: result.tenant.id,
      userId: result.user.id,
      slug: result.tenant.slug,
    };
  }

  private async generateUniqueSlug(
    name1: string,
    name2: string,
    weddingDate: Date,
  ): Promise<string> {
    const dateStr = weddingDate.toISOString().split('T')[0];
    const baseSlug = `${name1}-${name2}-${dateStr}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 2;

    while (await this.prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

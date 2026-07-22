import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './config/env.validation';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TemplatesModule } from './templates/templates.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    AuthModule,
    PrismaModule,
    TemplatesModule,
    TenantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

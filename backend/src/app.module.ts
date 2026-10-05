import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtworksModule } from './artworks/artworks.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    ArtworksModule,
  ],
})
export class AppModule {}

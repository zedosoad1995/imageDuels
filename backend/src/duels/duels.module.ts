import { Module } from '@nestjs/common';
import { DuelsController } from './duels.controller';
import { DuelsService } from './duels.service';
import { Glicko2Service } from 'src/providers/rating/glicko2/glicko2.service';
import { ImagesService } from 'src/images/images.service';
import { CollectionsService } from 'src/collections/collections.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [DuelsController],
  providers: [DuelsService, Glicko2Service, ImagesService, CollectionsService],
  exports: [DuelsService],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.DUELS_JWT_KEY,
      signOptions: { expiresIn: '2h' },
    }),
  ],
})
export class DuelsModule {}

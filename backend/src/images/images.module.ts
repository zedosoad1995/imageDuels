import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImagesPublicController } from './images.public.controller';
import { Glicko2Service } from 'src/providers/rating/glicko2/glicko2.service';

@Module({
  controllers: [ImagesController, ImagesPublicController],
  providers: [ImagesService, Glicko2Service],
  exports: [ImagesService],
})
export class ImagesModule {}

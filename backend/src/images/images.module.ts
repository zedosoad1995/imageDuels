import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImagesPublicController } from './images.public.controller';

@Module({
  controllers: [ImagesController, ImagesPublicController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}

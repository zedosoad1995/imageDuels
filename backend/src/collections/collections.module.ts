import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { ImagesService } from 'src/images/images.service';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService, ImagesService],
})
export class CollectionsModule {}

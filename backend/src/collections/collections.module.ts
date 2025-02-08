import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { ImagesService } from 'src/images/images.service';
import { DuelsService } from 'src/duels/duels.service';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService, ImagesService, DuelsService],
})
export class CollectionsModule {}

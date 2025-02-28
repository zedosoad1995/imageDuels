import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { ImagesService } from 'src/images/images.service';
import { DuelsService } from 'src/duels/duels.service';
import { Glicko2Service } from 'src/providers/rating/glicko2/glicko2.service';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService, ImagesService, DuelsService, Glicko2Service],
})
export class CollectionsModule {}

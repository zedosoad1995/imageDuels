import { Module } from '@nestjs/common';
import { DuelsController } from './duels.controller';
import { DuelsService } from './duels.service';
import { Glicko2Service } from 'src/providers/rating/glicko2/glicko2.service';

@Module({
  controllers: [DuelsController],
  providers: [DuelsService, Glicko2Service],
  exports: [DuelsService],
})
export class DuelsModule {}

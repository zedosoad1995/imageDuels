import { Module } from '@nestjs/common';
import { Glicko2Module } from './rating/glicko2/glicko2.module';

@Module({
  providers: [],
  imports: [Glicko2Module],
})
export class ProvidersModule {}

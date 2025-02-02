import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { DuelsService } from './duels.service';
import { AuthGuard } from 'src/auth/auth.guards';

@UseGuards(AuthGuard)
@Controller('duels')
export class DuelsController {
  constructor(private readonly duelsService: DuelsService) {}

  @Post()
  async create(@Request() req) {
    const duel = await this.duelsService.create('', '', req.user.id);

    return duel;
  }
}

import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guards';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { VoteDto, voteSchema } from './dto/vote.dto';
import { DuelsService } from './duels.service';

@UseGuards(AuthGuard)
@Controller('duels')
export class DuelsController {
  constructor(private readonly duelsService: DuelsService) {}

  @UsePipes(new ZodValidationPipe(voteSchema))
  @Post(':duelId/vote')
  async vote(
    @Request() req,
    @Param('duelId') duelId: string,
    @Body() voteDto: VoteDto,
  ) {
    const [image1, image2] = await this.duelsService.getDuelImages(
      duelId,
      req.user.id,
    );

    await this.duelsService.updateVote(duelId, voteDto.outcome, image1, image2);
  }
}

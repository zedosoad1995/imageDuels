import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { VoteDto, voteSchema } from './dto/vote.dto';
import { DuelsService } from './duels.service';
import { ProfileCompletedGuard } from 'src/users/guards/profileCompleted.guard';
import { ImagesService } from 'src/images/images.service';
import { CollectionsService } from 'src/collections/collections.service';
import { User } from '@prisma/client';
import { LoggedUser } from 'src/users/users.decorator';
import { JwtService } from '@nestjs/jwt';

@UseGuards(AuthGuard(true), ProfileCompletedGuard)
@Controller('duels')
export class DuelsController {
  constructor(
    private readonly duelsService: DuelsService,
    private readonly imagesService: ImagesService,
    private readonly collectionService: CollectionsService,
    private jwtService: JwtService,
  ) {}

  @Get('feed')
  async feed(@LoggedUser() user: User) {
    const collectionIds = await this.collectionService.getManyIdsForUserFeed({
      userId: user.id,
      showNSFW: user.canSeeNSFW,
    });

    const duels = await this.imagesService.getBulkMatchesImages(collectionIds);

    const tokens = await Promise.all(
      duels.map(([img1, img2]) => {
        return this.jwtService.signAsync({
          image1: img1.filepath,
          image2: img2.filepath,
        });
      }),
    );

    return duels.map((duel, index) => ({
      image1: duel[0].filepath,
      image2: duel[1].filepath,
      token: tokens[index],
    }));
  }

  @UsePipes(new ZodValidationPipe(voteSchema))
  @HttpCode(204)
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

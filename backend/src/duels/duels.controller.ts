import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
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
import { LoggedUser, UserId } from 'src/users/users.decorator';

@UseGuards(AuthGuard(true), ProfileCompletedGuard)
@Controller('duels')
export class DuelsController {
  constructor(
    private readonly duelsService: DuelsService,
    private readonly imagesService: ImagesService,
    private readonly collectionService: CollectionsService,
  ) {}

  @Get('feed')
  async feed(@LoggedUser() user: User) {
    const collectionIds = await this.collectionService.getManyIdsForUserFeed({
      userId: user.id,
      showNSFW: user.canSeeNSFW,
    });

    const duels = await this.imagesService.getBulkMatchesImages(collectionIds);

    const tokens = await Promise.all(
      duels.map(([img1, img2]) =>
        this.duelsService.generateToken(img1.id, img2.id),
      ),
    );

    return duels.map((duel, index) => ({
      image1: duel[0].filepath,
      image2: duel[1].filepath,
      token: tokens[index],
    }));
  }

  @UsePipes(new ZodValidationPipe(voteSchema))
  @HttpCode(204)
  @Post('vote')
  async vote(
    @Body() voteDto: VoteDto,
    @UserId({ getTokenFromHeader: true }) userId: string,
  ) {
    // TODO: SKIP. No reason to keep it. Simple do not call this endpoint when it is to skip.

    const [imageId1, imageId2] = await this.duelsService.getDuelImagesFromToken(
      voteDto.token,
    );

    const [image1, image2] = await Promise.all([
      this.imagesService.getOne(imageId1),
      this.imagesService.getOne(imageId2),
    ]);

    await this.duelsService.createVote(voteDto.outcome, image1, image2, userId);
  }
}

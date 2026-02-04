import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Query,
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
import { pick } from 'src/common/helpers/general';

@Controller('duels')
export class DuelsController {
  constructor(
    private readonly duelsService: DuelsService,
    private readonly imagesService: ImagesService,
    private readonly collectionService: CollectionsService,
  ) {}

  @Get('feed')
  async feed(
    @LoggedUser({ fetchUser: true }) user: User,
    @Query('cursor') cursor?: string,
  ) {
    const { collections, nextCursor } =
      await this.collectionService.getManyForUserFeed({
        userId: user?.id,
        showNSFW: user?.canSeeNSFW,
        isAdmin: user?.role === 'ADMIN',
        limit: 5,
        cursor,
      });

    const duels = await this.imagesService.getBulkMatchesImages(
      collections.map(({ id }) => id),
      user?.id,
      user?.role === 'ADMIN',
    );

    const tokens = await Promise.all(
      duels.map(({ duel: [img1, img2] }) =>
        this.duelsService.generateToken(img1.id, img2.id),
      ),
    );

    return {
      duels: duels.map(({ duel, collectionId }, index) => {
        const collection = collections.find(({ id }) => id === collectionId);
        if (!collection) {
          throw new InternalServerErrorException();
        }

        return {
          image1: pick(duel[0], [
            'availableFormats',
            'availableWidths',
            'filepath',
            'hasPlaceholder',
            'isSvg',
          ]),
          image2: pick(duel[1], [
            'availableFormats',
            'availableWidths',
            'filepath',
            'hasPlaceholder',
            'isSvg',
          ]),
          token: tokens[index],
          collectionId: collection.id,
          collectionName: collection.title,
        };
      }),
      nextCursor,
    };
  }

  @UseGuards(AuthGuard(true), ProfileCompletedGuard)
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

    await this.duelsService.createVote(
      voteDto.outcome,
      imageId1,
      imageId2,
      userId,
    );
  }
}

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DuelOutcomeEnum, Image } from '@prisma/client';
import { prisma } from 'src/common/helpers/prisma';
import { Glicko2Service } from 'src/providers/rating/glicko2/glicko2.service';

const logger = new Logger('Duels Service');

@Injectable()
export class DuelsService {
  constructor(private readonly glicko2: Glicko2Service) {}

  async getDuelImages(duelId: string, userId: string) {
    const duel = await prisma.duel.findUnique({
      where: {
        id: duelId,
      },
      include: {
        image1: {
          include: {
            collection: {
              select: {
                id: true,
                mode: true,
                ownerId: true,
              },
            },
          },
        },
        image2: {
          include: {
            collection: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!duel) {
      throw new NotFoundException(`Duel id ${duelId} not found`);
    }

    const image1 = duel.image1;
    const image2 = duel.image2;

    if (image1.collection.id !== image2.collection.id) {
      logger.error(
        `Duel with 2 images (${image1.id}, ${image2.id}) belonging to different collections (${image1.collection.id}, ${image2.collection.id})`,
      );
      throw new InternalServerErrorException();
    }

    const collection = image1.collection;
    if (collection.mode === 'PERSONAL' && collection.ownerId !== userId) {
      throw new NotFoundException(`Duel id ${duelId} not found`);
    }

    return [image1, image2];
  }

  create(image1: string, image2: string, userId: string) {
    return prisma.duel.upsert({
      create: {
        image1Id: image1,
        image2Id: image2,
        activeUserId: userId,
        voterId: userId,
      },
      update: {
        image1Id: image1,
        image2Id: image2,
      },
      where: {
        activeUserId: userId,
        isFinished: false,
      },
    });
  }

  async updateVote(
    duelId: string,
    outcome: DuelOutcomeEnum,
    image1: Image,
    image2: Image,
  ) {
    await prisma.$transaction(async (ctx) => {
      const queries: any[] = [
        ctx.duel.update({
          data: {
            outcome,
            isFinished: true,
            activeUserId: null,
          },
          where: {
            id: duelId,
            isFinished: false,
            NOT: {
              activeUserId: null,
            },
          },
        }),
      ];

      if (outcome !== 'SKIP') {
        const [image1Params, image2Params] = this.glicko2.calculateNewRatings(
          image1,
          image2,
          outcome === 'WIN',
        );

        queries.push(
          ctx.image.update({
            data: {
              numVotes: image1.numVotes + 1,
              ...image1Params,
            },
            where: {
              id: image1.id,
              version: image1.version,
            },
          }),
        );

        queries.push(
          ctx.image.update({
            data: {
              numVotes: image2.numVotes + 1,
              ...image2Params,
            },
            where: {
              id: image2.id,
              version: image2.version,
            },
          }),
        );
      }

      return Promise.all(queries);
    });
  }
}

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DuelOutcomeEnum } from '@prisma/client';
import { prisma } from 'src/common/prisma';
import { UpdateVoteProps } from './duels.type';

const logger = new Logger('Duels Service');

@Injectable()
export class DuelsService {
  async getDuelImages(duelId: string, userId: string) {
    const duel = await prisma.duel.findUnique({
      where: {
        id: duelId,
      },
      include: {
        image1: {
          select: {
            id: true,
            numVotes: true,
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
          select: {
            id: true,
            numVotes: true,
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
    image1: UpdateVoteProps,
    image2: UpdateVoteProps,
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
          },
        }),
      ];

      if (outcome !== 'SKIP') {
        queries.push(
          ctx.image.update({
            data: {
              numVotes: image1.numVotes + 1,
            },
            where: {
              id: image1.id,
            },
          }),
        );

        queries.push(
          ctx.image.update({
            data: {
              numVotes: image2.numVotes + 1,
            },
            where: {
              id: image2.id,
            },
          }),
        );
      }

      return Promise.all(queries);
    });
  }
}

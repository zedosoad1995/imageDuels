import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { DuelOutcomeEnum, Image } from '@prisma/client';
import { prisma } from 'src/common/helpers/prisma';
import { Glicko2Service } from 'src/providers/rating/glicko2/glicko2.service';

@Injectable()
export class DuelsService {
  constructor(
    private readonly glicko2: Glicko2Service,
    private jwtService: JwtService,
  ) {}

  async getDuelImagesFromToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.DUELS_JWT_KEY,
      });

      if (!payload.image1 || !payload.image2) {
        throw '';
      }

      return [payload.image1, payload.image2];
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BadRequestException({
          message: 'Duel expired',
          code: 'DUEL_EXPIRED',
        });
      }

      throw new BadRequestException({
        message: 'Invalid token',
      });
    }
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
    outcome: DuelOutcomeEnum,
    image1: Image,
    image2: Image,
    userId: string,
  ) {
    await prisma.$transaction(async (ctx) => {
      // TODO: remove activeUserId, isFinished, SKIP from outcome

      const queries: any[] = [
        ctx.duel.create({
          data: {
            outcome,
            isFinished: true,
            activeUserId: null,
            image1Id: image1.id,
            image2Id: image2.id,
            voterId: userId,
          },
        }),
      ];

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

      return Promise.all(queries);
    });
  }
}

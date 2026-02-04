import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { DuelOutcomeEnum, Prisma } from '@prisma/client';
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

  async generateToken(imgId1: string, imgId2: string) {
    return this.jwtService.signAsync({
      image1: imgId1,
      image2: imgId2,
    });
  }

  async createVote(
    outcome: DuelOutcomeEnum,
    image1Id: string,
    image2Id: string,
    userId: string,
  ) {
    const imageIds = [image1Id, image2Id].sort();

    await prisma.$transaction(async (ctx) => {
      const images = await ctx.$queryRaw<
        {
          id: string;
          rating: number;
          ratingDeviation: number;
          volatility: number;
          votedDaysAgo: number | null;
        }[]
      >`
        SELECT id, rating, rating_deviation AS "ratingDeviation", volatility, (CURRENT_DATE - last_vote_at::date) AS "votedDaysAgo"
        FROM images
        WHERE id IN (${Prisma.join(imageIds)})
        ORDER BY id
        FOR UPDATE
    `;

      if (images.length !== 2) {
        console.error(
          'Images len must be 2',
          image1Id,
          image2Id,
          images.length,
        );
        throw new InternalServerErrorException();
      }

      // TODO: Is this really necessary? Only for analytics, or if in the future we want to show. But maybe we can simply accept that there will be data missing in the past. Another advantage is if we want to reconstruct the rating in some way... But is this table that bad, in terms of performance, or memory
      await ctx.duel.create({
        data: {
          outcome,
          image1Id,
          image2Id,
          voterId: userId,
        },
      });

      await ctx.$queryRaw(
        Prisma.sql`
          INSERT INTO user_votes (image_id, voter_id, num_votes)
          VALUES
            (${image1Id}, ${userId}, 1),
            (${image2Id}, ${userId}, 1)
          ON CONFLICT (voter_id, image_id)
          DO UPDATE SET num_votes = user_votes.num_votes + 1;
        `,
      );

      const byId = new Map(images.map((r) => [r.id, r]));
      const img1 = byId.get(image1Id)!;
      const img2 = byId.get(image2Id)!;

      let image1Params = this.glicko2.updateTimeDecay(img1, img1.votedDaysAgo);
      let image2Params = this.glicko2.updateTimeDecay(img2, img2.votedDaysAgo);

      const im1Won = outcome === 'WIN';
      [image1Params, image2Params] = this.glicko2.calculateNewRatings(
        image1Params,
        image2Params,
        im1Won,
      );

      await ctx.image.update({
        data: {
          numVotes: { increment: 1 },
          lastVoteAt: new Date(),
          ...image1Params,
        },
        where: {
          id: img1.id,
        },
      });

      await ctx.image.update({
        data: {
          numVotes: { increment: 1 },
          lastVoteAt: new Date(),
          ...image2Params,
        },
        where: {
          id: img2.id,
        },
      });
    });
  }
}

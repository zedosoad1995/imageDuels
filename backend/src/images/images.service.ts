import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/common/helpers/prisma';
import {
  FAIR_TEMPERATURE,
  RATING_INI,
  RD_INI,
  VOLATILITY_INI,
} from './constants/rating';
import { randInt } from 'src/common/helpers/random';
import { Image, Prisma, User } from '@prisma/client';
import { imageSize } from 'image-size';
import * as fs from 'node:fs';

@Injectable()
export class ImagesService {
  async create(collectionId: string, imageFile: Express.Multer.File) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection id ${collectionId} does not exist`,
      );
    }

    const fileBuffer = await fs.promises.readFile(imageFile.path);
    const { width, height } = imageSize(fileBuffer);

    return prisma.image.create({
      data: {
        filepath: imageFile.filename,
        rating: RATING_INI,
        ratingDeviation: RD_INI,
        volatility: VOLATILITY_INI,
        collectionId,
        height,
        width,
      },
    });
  }

  async getBulkMatchesImages(
    collectionIds: string[],
    userId: string | undefined,
    isAdmin: boolean | undefined,
  ) {
    const res = await Promise.allSettled(
      collectionIds.map((id) => this.getMatchImages(id, userId, isAdmin)),
    );

    return res.filter((val) => val.status === 'fulfilled').map((r) => r.value);
  }

  async getMatchImages(
    collectionId: string,
    userId: string | undefined,
    isAdmin: boolean | undefined,
  ): Promise<
    [
      Pick<Image, 'id' | 'filepath' | 'numVotes'>,
      Pick<Image, 'id' | 'filepath' | 'numVotes'>,
    ]
  > {
    const lowVoteImages = await prisma.$queryRaw<
      {
        id: string;
        filepath: string;
        numVotes: number;
        rating: number;
      }[]
    >(Prisma.sql`
      SELECT i.id, i.filepath, i.num_votes AS "numVotes", i.rating
      FROM images i
      INNER JOIN collections c ON c.id = i.collection_id
      WHERE
        i.collection_id = ${collectionId}
        AND (
          ${userId}::text IS NULL 
          OR ${isAdmin} IS TRUE
          OR c.max_user_votes_per_image IS NULL 
            OR NOT EXISTS (
              SELECT 1 
              FROM duels 
              WHERE voter_id = ${userId} AND image1_id = i.id
              OFFSET (c.max_user_votes_per_image - 1) 
              LIMIT 1 
            )
        )
      ORDER BY i.num_votes ASC
      LIMIT 5
    `);

    if (lowVoteImages.length < 2) {
      throw new BadRequestException('There are not enough images');
    }

    const minVotes = Math.min(...lowVoteImages.map(({ numVotes }) => numVotes));
    const lowestVotesImages = lowVoteImages.filter(
      ({ numVotes }) => numVotes === minVotes,
    );

    const image1 = lowestVotesImages[randInt(lowestVotesImages.length - 1)];

    const candidateImagesLow = await prisma.$queryRaw<
      {
        id: string;
        filepath: string;
        numVotes: number;
        rating: number;
        votedDaysAgo: number | null;
      }[]
    >(Prisma.sql`
      SELECT id, filepath, num_votes AS "numVotes", rating, (CURRENT_DATE - last_vote_at::date) AS "votedDaysAgo"
      FROM images
      WHERE collection_id = ${collectionId} AND (rating, id) < (${image1.rating}, ${image1.id})
      ORDER BY rating DESC
      LIMIT 100
    `);

    const candidateImagesHigh = await prisma.$queryRaw<
      {
        id: string;
        filepath: string;
        numVotes: number;
        rating: number;
        votedDaysAgo: number | null;
      }[]
    >(Prisma.sql`
      SELECT id, filepath, num_votes AS "numVotes", rating, (CURRENT_DATE - last_vote_at::date) AS "votedDaysAgo"
      FROM images
      WHERE collection_id = ${collectionId} AND (rating, id) > (${image1.rating}, ${image1.id})
      ORDER BY rating ASC
      LIMIT 100
    `);

    const candidateImages = [...candidateImagesLow, ...candidateImagesHigh];

    const maxVotedDaysAgo =
      Math.max(...candidateImages.map((i) => i.votedDaysAgo ?? 0)) || 1;

    const weights = candidateImages.map(({ rating, votedDaysAgo }) => {
      const ratingSimilarity = Math.max(
        Math.exp(-Math.abs(rating - image1.rating) / FAIR_TEMPERATURE),
      );

      const votedDaysAgoNorm = votedDaysAgo
        ? 1 - votedDaysAgo / maxVotedDaysAgo
        : 0;

      const DAYS_AGO_NORM_CUTOFF = 0.7;
      const lastVoteValue =
        votedDaysAgoNorm > DAYS_AGO_NORM_CUTOFF
          ? (votedDaysAgoNorm - DAYS_AGO_NORM_CUTOFF) /
            (1 - DAYS_AGO_NORM_CUTOFF)
          : 0;

      return ratingSimilarity + 0.3 * lastVoteValue;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let threshold = Math.random() * totalWeight;
    let image2 = candidateImages[0];

    for (let i = 0; i < candidateImages.length; i++) {
      threshold -= weights[i];
      if (threshold <= 0) {
        image2 = candidateImages[i];
        break;
      }
    }

    if (Math.random() < 0.5) {
      return [image2, image1];
    }

    return [image1, image2];
  }

  async getOne(imageId: string): Promise<Image> {
    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
      },
    });

    if (!image) {
      throw new BadRequestException(`Invalid image ${imageId}`);
    }

    return image;
  }

  async deleteOne(imageId: string, userId: string, isAdmin: boolean) {
    const image = await prisma.image.findUnique({
      select: {
        id: true,
      },
      where: {
        id: imageId,
        collection: {
          ownerId: isAdmin ? undefined : userId,
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return prisma.image.delete({
      select: {
        id: true,
        filepath: true,
      },
      where: {
        id: imageId,
      },
    });
  }
}

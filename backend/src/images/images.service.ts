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
import { generateRandomString, randInt } from 'src/common/helpers/random';
import { Image, Prisma, User } from '@prisma/client';
import { imageSize } from 'image-size';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';
import { Glicko2Service } from 'src/providers/rating/glicko2/glicko2.service';

const UPLOAD_FOLDER = './uploads';

const MAX_DIM = 1920;
const WEBP_QUALITY = 75;
const JPEG_FALLBACK_QUALITY = 65;

// safety: reject insane pixel counts (prevents some decompression bombs)
const MAX_INPUT_PIXELS = 120e6; // 120 megapixels (tune)

function makeId() {
  return `${Date.now()}-${generateRandomString(12)}`;
}

@Injectable()
export class ImagesService {
  constructor(private readonly glicko2: Glicko2Service) {}

  async create(collectionId: string, imageFile: Express.Multer.File) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection id ${collectionId} does not exist`,
      );
    }

    const baseName = makeId();

    if (imageFile.mimetype === 'image/svg+xml') {
      const { width, height } = imageSize(imageFile.buffer);

      await fsPromises.mkdir(`${UPLOAD_FOLDER}/${baseName}`, {
        recursive: true,
      });

      const svgPath = path.join(UPLOAD_FOLDER, `${baseName}/svg.svg`);
      await fsPromises.writeFile(svgPath, imageFile.buffer);

      return prisma.image.create({
        data: {
          filepath: baseName,
          rating: RATING_INI,
          ratingDeviation: RD_INI,
          volatility: VOLATILITY_INI,
          collectionId,
          width,
          height,
          isSvg: true,
        },
      });
    }

    try {
      // Raster: resize -> encode webp + jpeg
      const pipeline = sharp(imageFile.buffer, {
        failOnError: false,
        limitInputPixels: MAX_INPUT_PIXELS,
      });

      const originalWidth = (await pipeline.metadata()).width;

      const variants: {
        buffer: Buffer<ArrayBufferLike>;
        width: number;
        format: string;
        key: string;
        contentType: string;
      }[] = [];

      const availableWidths = [400, 800, 1920].filter(
        (val, i) => val <= originalWidth || i === 0,
      );

      await Promise.all(
        availableWidths.flatMap((width) => {
          const base = pipeline.resize({
            width,
            fit: 'inside',
            withoutEnlargement: true,
          });

          const webpBuf = base
            .clone()
            .webp({ quality: WEBP_QUALITY })
            .toBuffer()
            .then((buffer) => {
              variants.push({
                width: width,
                format: 'webp',
                key: `${baseName}/w${width}.webp`,
                contentType: 'image/webp',
                buffer,
              });
            });

          const jpgBuf = base
            .clone()
            .jpeg({ quality: JPEG_FALLBACK_QUALITY, mozjpeg: true })
            .toBuffer()
            .then((buffer) => {
              variants.push({
                width: width,
                format: 'jpg',
                key: `${baseName}/w${width}.jpg`,
                contentType: 'image/jpeg',
                buffer,
              });
            });

          return [webpBuf, jpgBuf];
        }),
      );

      const placeholderBuf = await pipeline
        .resize({ width: 32, withoutEnlargement: true })
        .jpeg({ quality: 35 })
        .blur(8)
        .toBuffer();

      variants.push({
        width: 32,
        format: 'jpg',
        key: `${baseName}/placeholder.jpg`,
        contentType: 'image/jpeg',
        buffer: placeholderBuf,
      });

      const outMeta = await sharp(variants.at(-2)!.buffer).metadata();
      if (!outMeta.width || !outMeta.height) {
        throw new BadRequestException('Could not read output image dimensions');
      }

      await fsPromises.mkdir(`${UPLOAD_FOLDER}/${baseName}`, {
        recursive: true,
      });

      await Promise.all(
        variants.map((v) =>
          fsPromises.writeFile(path.join(UPLOAD_FOLDER, v.key), v.buffer),
        ),
      );

      return prisma.image.create({
        data: {
          filepath: baseName,
          rating: RATING_INI,
          ratingDeviation: RD_INI,
          volatility: VOLATILITY_INI,
          collectionId,
          width: outMeta.width,
          height: outMeta.height,
          availableWidths,
          availableFormats: ['webp', 'jpg'],
          hasPlaceholder: true,
        },
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Invalid or unsupported image file');
    }
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
  ) {
    const lowVoteImages = await prisma.$queryRaw<
      {
        id: string;
        filepath: string;
        numVotes: number;
        rating: number;
        ratingDeviation: number;
        volatility: number;
        winProb: number;
        hasPlaceholder: boolean;
        availableWidths: number[];
        availableFormats: string[];
        isSvg: boolean;
      }[]
    >(Prisma.sql`
      SELECT 
        i.id, 
        i.filepath, 
        i.num_votes AS "numVotes", 
        i.rating,
        i.rating_deviation AS "ratingDeviation",
        i.volatility,
        i.has_placeholder AS "hasPlaceholder", 
        i.available_widths AS "availableWidths", 
        i.available_formats AS "availableFormats", 
        i.is_svg AS "isSvg"
      FROM images i
      INNER JOIN collections c ON c.id = i.collection_id
      INNER JOIN users u ON c.owner_id = u.id
      WHERE
        i.collection_id = ${collectionId}
        AND u.is_banned IS FALSE
        AND (
          ${userId}::text IS NULL 
          OR ${isAdmin} IS TRUE
          OR c.max_user_votes_per_image IS NULL 
          OR NOT EXISTS (
            SELECT 1 
            FROM user_votes
            WHERE voter_id = ${userId} AND image_id = i.id AND num_votes >= c.max_user_votes_per_image
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

    const candidateImages = await prisma.$queryRaw<
      {
        id: string;
        filepath: string;
        numVotes: number;
        rating: number;
        ratingDeviation: number;
        volatility: number;
        winProb: number;
        votedDaysAgo: number | null;
        hasPlaceholder: boolean;
        availableWidths: number[];
        availableFormats: string[];
        isSvg: boolean;
      }[]
    >(Prisma.sql`
      SELECT *
      FROM (
        (
          SELECT 
            id, 
            filepath, 
            num_votes AS "numVotes", 
            rating, 
            rating_deviation AS "ratingDeviation",
            volatility,
            (CURRENT_DATE - last_vote_at::date) AS "votedDaysAgo", 
            has_placeholder AS "hasPlaceholder", 
            available_widths AS "availableWidths", 
            available_formats AS "availableFormats", 
            is_svg AS "isSvg"
          FROM images
          WHERE collection_id = ${collectionId} AND (rating, id) < (${image1.rating}, ${image1.id})
          ORDER BY rating DESC
          LIMIT 100
        )
        UNION ALL
        (
          SELECT 
            id, 
            filepath, 
            num_votes AS "numVotes", 
            rating, 
            rating_deviation AS "ratingDeviation",
            volatility,
            (CURRENT_DATE - last_vote_at::date) AS "votedDaysAgo", 
            has_placeholder AS "hasPlaceholder", 
            available_widths AS "availableWidths", 
            available_formats AS "availableFormats", 
            is_svg AS "isSvg"
          FROM images
          WHERE collection_id = ${collectionId} AND (rating, id) > (${image1.rating}, ${image1.id})
          ORDER BY rating ASC
          LIMIT 100
        )
      )
    `);

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

    image1.winProb = this.glicko2.getWinProbability(image1, image2);
    image2.winProb = 1 - image1.winProb;

    if (Math.random() < 0.5) {
      return { duel: [image2, image1], collectionId };
    }

    return { duel: [image1, image2], collectionId };
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

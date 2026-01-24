import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/common/helpers/prisma';
import { CreateCollectionDto } from './dto/createCollection.dto';
import { Prisma } from '@prisma/client';
import { IGetCollections, IGetCollectionsOrderBy } from './collections.type';
import { EditCollectionDto } from './dto/editCollection.dto';
import { decodeCursor, encodeCursor } from 'src/common/helpers/cursor';

@Injectable()
export class CollectionsService {
  async getMany({
    onlySelf,
    userId,
    orderBy,
    showAllModes,
    showNSFW,
    search,
    limit = 20,
    cursor,
  }: IGetCollections) {
    const orderByOptions = orderBy
      ? {
          new: {
            cursorField: 'lastCreatedAt',
            transCollectionField: 'createdAt',
          },
          popular: {
            cursorField: 'lastTotalVotes',
            transCollectionField: 'totalVotes',
          },
        }[orderBy]
      : undefined;

    const decodedCursor = decodeCursor(cursor);

    const isCursorValid =
      !!decodedCursor &&
      !!orderByOptions &&
      !!decodedCursor.lastId &&
      decodedCursor[orderByOptions.cursorField] !== undefined &&
      decodedCursor[orderByOptions.cursorField] !== null;

    const where: Prisma.Sql[] = [];

    if (userId) {
      where.push(Prisma.sql`c.owner_id = ${userId}`);
    } else if (!showAllModes) {
      where.push(Prisma.sql`c.mode = 'PUBLIC'`, Prisma.sql`c.is_live IS TRUE`);
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      const like = `%${trimmedSearch}%`;

      where.push(Prisma.sql`
        (
          c.title ILIKE ${like}
          OR c.description ILIKE ${like}
          OR c.question ILIKE ${like}
        )
      `);
    }

    if (!showNSFW) {
      where.push(Prisma.sql`c.is_nsfw IS FALSE`);
    }

    if (!onlySelf) {
      // Check if valid (Must have >= 2 images)
      where.push(Prisma.sql`c.num_images >= 2`);
    }

    const order: Prisma.Sql[] = [];
    if (orderBy === 'new') {
      order.push(Prisma.sql`c.created_at DESC`, Prisma.sql`c.id DESC`);

      if (isCursorValid) {
        const lastCreatedAtMs = new Date(
          decodedCursor.lastCreatedAt as string,
        ).getTime();
        where.push(Prisma.sql`
          (
            c.created_at < ${lastCreatedAtMs}
            OR (
              c.created_at = ${lastCreatedAtMs}
              AND c.id < ${decodedCursor.lastId}
            )
          )
        `);
      }
    } else if (orderBy === 'popular') {
      order.push(Prisma.sql`c.num_votes DESC`, Prisma.sql`c.id DESC`);

      if (isCursorValid) {
        where.push(
          Prisma.sql`((c.num_votes, c.id) < (${decodedCursor.lastTotalVotes}, ${decodedCursor.lastId})`,
        );
      }
    }

    const whereSql = where.length
      ? Prisma.sql`WHERE ${Prisma.join(where, ' AND ')}`
      : Prisma.empty;

    const orderSql = order.length
      ? Prisma.sql`ORDER BY ${Prisma.join(order, ', ')}`
      : Prisma.sql`ORDER BY c.id DESC`;

    const collections = await prisma.$queryRaw<
      {
        id: string;
        title: string;
        description: string | null;
        question: string | null;
        mode: string;
        isNSFW: boolean;
        isLive: boolean;
        total_images: number;
        total_votes: number;
        thumbnail_images: string[];
        owner_username: string;
      }[]
    >(Prisma.sql`
      SELECT
        c.id,
        c.title,
        c.question,
        c.description,
        c.mode,
        c.is_nsfw AS "isNSFW",
        c.is_live AS "isLive",
        c.created_at,
        c.num_images AS total_images,
        c.num_votes  AS total_votes,
        COALESCE((
          SELECT json_agg(filepath)
          FROM (
            SELECT filepath
            FROM images
            WHERE collection_id = c.id
            ORDER BY rating DESC, id ASC
            LIMIT 3
          ) AS t
        ), '[]'::json) AS thumbnail_images,
        u.username AS owner_username
      FROM collections c
      INNER JOIN users u
        ON u.id = c.owner_id
      ${whereSql}
      ${orderSql}
      LIMIT ${limit}
    `);

    const transformedCollections = collections.map(
      ({
        owner_username,
        thumbnail_images,
        total_images,
        total_votes,
        ...collection
      }) => ({
        ...collection,
        createdBy: owner_username,
        totalImages: Number(total_images),
        totalVotes: Number(total_votes),
        thumbnailImages: thumbnail_images,
        isValid: this.isValid(total_images),
      }),
    );

    const lastCollection = transformedCollections.at(-1);

    const nextCursor =
      lastCollection &&
      orderByOptions &&
      transformedCollections.length === limit
        ? encodeCursor({
            lastId: lastCollection.id,
            [orderByOptions.cursorField]:
              lastCollection[orderByOptions.transCollectionField],
          })
        : null;

    return { collections: transformedCollections, nextCursor };
  }

  async getManyForUserFeed({
    userId,
    showNSFW,
    limit = 20,
    cursor,
  }: {
    userId?: string;
    showNSFW?: boolean;
    limit?: number;
    cursor?: string | null | undefined;
  }) {
    const decodedCursor = decodeCursor(cursor);

    const isCursorValid = decodedCursor && decodedCursor.lastId;

    const whereCursor = isCursorValid
      ? Prisma.sql`AND c.id > ${decodedCursor.lastId}`
      : Prisma.empty;

    const whereOwner = userId
      ? Prisma.sql`AND c.owner_id <> ${userId}`
      : Prisma.empty;

    const whereNSFW = showNSFW
      ? Prisma.empty
      : Prisma.sql`AND c.is_nsfw IS FALSE`;

    const collections = await prisma.$queryRaw<{ id: string; title: string }[]>(
      Prisma.sql`
      SELECT c.id, c.title
      FROM collections c
      WHERE c.mode = 'PUBLIC'
        AND c.is_live IS TRUE
        AND c.num_images >= 2
        ${whereNSFW}
        ${whereOwner}
        ${whereCursor}
      ORDER BY c.id
      LIMIT ${limit}
    `,
    );

    const lastCollection = collections.at(-1);

    const nextCursor =
      lastCollection && collections.length === limit
        ? encodeCursor({ lastId: lastCollection.id })
        : null;

    return { collections, nextCursor };
  }

  async getOne(
    collectionId: string,
    userId: string | undefined,
    cursor: string | null | undefined,
  ) {
    const NUM_IMAGES = 25;

    const decodedCursor = decodeCursor(cursor);

    const whereImagesClause: Prisma.ImageWhereInput = {};

    const isCursorValid =
      decodedCursor &&
      decodedCursor.lastRating !== undefined &&
      decodedCursor.lastId;

    if (isCursorValid) {
      whereImagesClause.OR = [
        { rating: { lt: decodedCursor.lastRating as number } },
        {
          rating: decodedCursor.lastRating as number,
          id: { lt: decodedCursor.lastId as string },
        },
      ];
    }

    const [collection, totalImages, startPosition] = await Promise.all([
      prisma.collection.findUnique({
        where: {
          id: collectionId,
        },
        include: {
          images: {
            select: {
              id: true,
              filepath: true,
              numVotes: true,
              rating: true,
              height: true,
              width: true,
            },
            where: whereImagesClause,
            orderBy: [{ rating: 'desc' }, { id: 'desc' }],
            take: NUM_IMAGES,
          },
        },
      }),
      prisma.image.count({
        where: { collectionId },
      }),
      isCursorValid
        ? prisma.image.count({
            where: {
              collectionId,
              OR: [
                { rating: { gt: decodedCursor.lastRating as number } },
                {
                  rating: decodedCursor.lastRating as number,
                  id: { gte: decodedCursor.lastId as string },
                },
              ],
            },
          })
        : Promise.resolve(0),
    ]);

    if (!collection) {
      throw new NotFoundException(
        `Collection id ${collectionId} does not exist`,
      );
    }

    const lastImage = collection.images.at(-1);

    const nextCursor =
      lastImage && collection.images.length === NUM_IMAGES
        ? encodeCursor({ lastRating: lastImage.rating, lastId: lastImage.id })
        : null;

    const transformedCollection = {
      ...collection,
      images: collection.images.map(({ rating, ...image }, index) => ({
        ...image,
        percentile:
          totalImages > 1
            ? (totalImages - (startPosition + index) - 1) / (totalImages - 1)
            : 1,
      })),
      belongsToMe: collection.ownerId === userId,
      nextCursor,
    };

    return transformedCollection;
  }

  isValid(numImages: number) {
    return numImages >= 2;
  }

  async create(collection: CreateCollectionDto, userId: string) {
    const foundCollection = await prisma.collection.findFirst({
      where: {
        title: collection.title,
        ownerId: userId,
      },
    });

    if (foundCollection) {
      throw new BadRequestException(
        `You already have a collection with the title "${foundCollection.title}"`,
      );
    }

    return prisma.collection.create({
      data: {
        ...collection,
        ownerId: userId,
      },
    });
  }

  async edit(
    collectionId: string,
    collectionBody: EditCollectionDto,
    userId: string,
    isAdmin: boolean,
  ) {
    const foundCollection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        ownerId: isAdmin ? undefined : userId,
      },
    });

    if (!foundCollection) {
      throw new BadRequestException(
        'This collection cannot be edit, either does not exist, or user does not have permissions to edit it',
      );
    }

    return prisma.collection.update({
      where: {
        id: collectionId,
      },
      data: collectionBody,
    });
  }

  async deleteOne(collectionId: string, userId: string, isAdmin: boolean) {
    const whereQuery: Prisma.CollectionWhereUniqueInput = { id: collectionId };

    if (!isAdmin) {
      whereQuery.ownerId = userId;
    }

    return prisma.collection.delete({
      select: {
        images: {
          select: {
            filepath: true,
          },
        },
      },
      where: whereQuery,
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/common/helpers/prisma';
import { CreateCollectionDto } from './dto/createCollection.dto';
import { Prisma } from '@prisma/client';
import {
  IGetCollectionOrderBy,
  IGetCollections,
  IGetCollectionsOrderBy,
} from './collections.type';
import { EditCollectionDto } from './dto/editCollection.dto';
import { decodeCursor, encodeCursor } from 'src/common/helpers/cursor';
import { randomUUID } from 'crypto';
import { sampleN } from 'src/common/helpers/random';

@Injectable()
export class CollectionsService {
  async getMany({
    onlySelf,
    userId,
    orderBy,
    showAllModes,
    mode,
    showNSFW,
    search,
    limit = 20,
    cursor,
    isAdmin,
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

    if (!showAllModes) {
      if (mode) {
        where.push(Prisma.sql`c.mode = ${mode}::"CollectionModeEnum"`);
      } else {
        where.push(Prisma.sql`c.mode = 'PUBLIC'`);
      }
    }

    if (userId) {
      where.push(Prisma.sql`c.owner_id = ${userId}`);
    }

    if (!onlySelf) {
      if (!isAdmin) {
        where.push(Prisma.sql`c.is_live IS TRUE`);
      }
      where.push(Prisma.sql`c.num_images >= 2`);
    }

    if (!showNSFW) {
      where.push(Prisma.sql`c.is_nsfw IS FALSE`);
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch && trimmedSearch.length > 1) {
      where.push(Prisma.sql`
        search_tsv @@ to_tsquery(
          'simple',
          regexp_replace(trim(${trimmedSearch}), '[[:space:]]+', ':* & ', 'g') || ':*'
        )
      `);
    }

    const order: Prisma.Sql[] = [];
    if (orderBy === 'new') {
      order.push(Prisma.sql`c.created_at DESC`, Prisma.sql`c.id DESC`);

      if (isCursorValid) {
        const lastCreatedAt = new Date(decodedCursor.lastCreatedAt as string);

        where.push(Prisma.sql`
            (c.created_at, c.id) < (${lastCreatedAt}, ${decodedCursor.lastId})
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
        totalImages: number;
        totalVotes: number;
        thumbnail_images: {
          filepath: string;
          hasPlaceholder: boolean;
          availableWidths: number[];
          availableFormats: string[];
          isSvg: boolean;
        }[];
        owner_username: string;
        createdAt: Date;
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
        c.num_images AS "totalImages",
        c.num_votes  AS "totalVotes",
        c.created_at AS "createdAt",
        COALESCE(
          (
            SELECT jsonb_agg(to_jsonb(t) ORDER BY t.rating DESC, t.id ASC)
            FROM (
              SELECT
                filepath,
                has_placeholder AS "hasPlaceholder",
                available_widths AS "availableWidths",
                available_formats AS "availableFormats",
                is_svg AS "isSvg",
                rating,
                id
              FROM images
              WHERE collection_id = c.id
              ORDER BY rating DESC, id ASC
              LIMIT 3
            ) AS t
          ),
          '[]'::jsonb
        ) AS thumbnail_images,
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
        totalImages,
        totalVotes,
        ...collection
      }) => ({
        ...collection,
        createdBy: owner_username,
        totalImages: Number(totalImages),
        totalVotes: Number(totalVotes),
        thumbnailImages: thumbnail_images,
        isValid: this.isValid(totalImages),
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
    isAdmin,
    limit = 5,
    cursor,
  }: {
    userId?: string;
    showNSFW?: boolean;
    isAdmin?: boolean;
    limit?: number;
    cursor?: string | null | undefined;
  }) {
    const decodedCursor = decodeCursor(cursor);

    const isCursorValid = decodedCursor && decodedCursor.lastId;

    const whereCursor = isCursorValid
      ? Prisma.sql`AND c.id <> ${decodedCursor.lastId}`
      : Prisma.empty;

    const whereOwner = userId
      ? Prisma.sql`AND c.owner_id <> ${userId}`
      : Prisma.empty;

    const whereNSFW = showNSFW
      ? Prisma.empty
      : Prisma.sql`AND c.is_nsfw IS FALSE`;

    const randomId = randomUUID();

    let collections = await prisma.$queryRaw<
      { id: string; title: string; question?: string }[]
    >(
      Prisma.sql`
      WITH candidates AS (
        (  
          SELECT c.id, c.title, c.question
          FROM collections c
          WHERE c.mode = 'PUBLIC'
            AND c.is_live IS TRUE
            AND c.num_images >= 2
            AND c.id >= ${randomId}
            AND (
              ${userId}::text IS NULL 
              OR ${isAdmin} IS TRUE
              OR c.max_user_votes_per_image IS NULL 
              OR EXISTS (
                SELECT 1 
                FROM user_votes uv
                LEFT JOIN images i
                  ON uv.image_id = i.id AND i.collection_id = c.id
                WHERE (uv.voter_id = ${userId} AND uv.image_id = i.id AND uv.num_votes < c.max_user_votes_per_image) OR i.id IS NULL
                OFFSET 1
                LIMIT 1
              )
            )
            ${whereNSFW}
            ${whereOwner}
            ${whereCursor}
          ORDER BY c.id
          LIMIT ${limit}
        )
        UNION ALL
        (
          SELECT c.id, c.title, c.question
          FROM collections c
          WHERE c.mode = 'PUBLIC'
            AND c.is_live IS TRUE
            AND c.num_images >= 2
            AND c.id < ${randomId}
            AND (
              ${userId}::text IS NULL 
              OR ${isAdmin} IS TRUE
              OR c.max_user_votes_per_image IS NULL 
              OR EXISTS (
                SELECT 1 
                FROM user_votes uv
                INNER JOIN images i
                  ON uv.image_id = i.id AND i.collection_id = c.id
                WHERE (uv.voter_id = ${userId} AND uv.image_id = i.id AND uv.num_votes < c.max_user_votes_per_image) OR i.id IS NULL
                OFFSET 1
                LIMIT 1
              )
            )
            ${whereNSFW}
            ${whereOwner}
            ${whereCursor}
          ORDER BY c.id DESC
          LIMIT ${limit}
        )
      )
      SELECT *
      FROM candidates
    `,
    );

    if (collections.length < limit) {
      const numRepetitions = Math.ceil(collections.length / limit);

      for (let i = 1; i <= numRepetitions; i++) {
        collections.push(...collections);
      }

      collections.splice(limit);
    } else if (collections.length > limit) {
      collections = sampleN(collections, limit);
    }

    const lastCollection = collections.at(-1);

    const nextCursor =
      lastCollection && collections.length === limit
        ? encodeCursor({ lastId: lastCollection.id })
        : null;

    return { collections, nextCursor };
  }

  async getOne(
    collectionId: string,
    orderBy: IGetCollectionOrderBy,
    userId: string | undefined,
    cursor: string | null | undefined,
  ) {
    const NUM_IMAGES = 25;

    const decodedCursor = decodeCursor(cursor);

    const whereImagesClause: Prisma.ImageWhereInput = {};
    let orderByClause: Prisma.ImageOrderByWithRelationInput[] = [];

    const isCursorValid =
      decodedCursor &&
      decodedCursor.lastRating !== undefined &&
      decodedCursor.lastId &&
      decodedCursor.nextImageIndex !== undefined;

    // TODO: order by newest
    if (isCursorValid) {
      if (orderBy === 'best-rated') {
        whereImagesClause.OR = [
          { rating: { lt: decodedCursor.lastRating as number } },
          {
            rating: decodedCursor.lastRating as number,
            id: { lt: decodedCursor.lastId as string },
          },
        ];
      } else if (orderBy === 'worst-rated') {
        whereImagesClause.OR = [
          { rating: { gt: decodedCursor.lastRating as number } },
          {
            rating: decodedCursor.lastRating as number,
            id: { gt: decodedCursor.lastId as string },
          },
        ];
      }
    }

    if (orderBy === 'best-rated') {
      orderByClause = [{ rating: 'desc' }, { id: 'desc' }];
    } else if (orderBy === 'worst-rated') {
      orderByClause = [{ rating: 'asc' }, { id: 'asc' }];
    } else {
      orderByClause = [{ createdAt: 'desc' }, { id: 'desc' }];
    }

    const collection = await prisma.collection.findUnique({
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
            availableFormats: true,
            availableWidths: true,
            hasPlaceholder: true,
            isSvg: true,
          },
          where: whereImagesClause,
          orderBy: orderByClause,
          take: NUM_IMAGES,
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection id ${collectionId} does not exist`,
      );
    }

    const lastImage = collection.images.at(-1);

    const startPosition = (decodedCursor?.nextImageIndex as number) ?? 0;

    const nextCursor =
      lastImage && collection.images.length === NUM_IMAGES
        ? encodeCursor({
            lastRating: lastImage.rating,
            lastId: lastImage.id,
            nextImageIndex: collection.images.length + startPosition,
          })
        : null;

    const transformedCollection = {
      ...collection,
      images: collection.images.map(({ rating, ...image }, index) => {
        let percentile = 0;

        if (orderBy === 'best-rated') {
          percentile =
            collection.numImages > 1
              ? (collection.numImages - (startPosition + index) - 1) /
                (collection.numImages - 1)
              : 1;
        } else if (orderBy === 'worst-rated') {
          percentile =
            collection.numImages > 1
              ? (startPosition + index) / (collection.numImages - 1)
              : 1;
        }

        return {
          ...image,
          percentile,
        };
      }),
      belongsToMe: collection.ownerId === userId,
      nextCursor,
    };

    return transformedCollection;
  }

  isValid(numImages: number) {
    return numImages >= 2;
  }

  async getMyStats(userId: string) {
    const countsByMode = await prisma.collection.groupBy({
      where: {
        ownerId: userId,
      },
      by: ['mode'],
      _count: true,
    });

    return {
      publicCount:
        countsByMode.find(({ mode }) => mode === 'PUBLIC')?._count ?? 0,
      privateCount:
        countsByMode.find(({ mode }) => mode === 'PRIVATE')?._count ?? 0,
      personalCount:
        countsByMode.find(({ mode }) => mode === 'PERSONAL')?._count ?? 0,
    };
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

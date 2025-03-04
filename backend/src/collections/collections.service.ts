import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/common/helpers/prisma';
import { CreateCollectionDto } from './dto/createCollection.dto';
import { Prisma } from '@prisma/client';
import { IGetCollections } from './collections.type';

@Injectable()
export class CollectionsService {
  async getMany({ userId, orderBy }: IGetCollections = {}) {
    const whereQuery: Prisma.CollectionWhereInput = {};
    const orderByQuery: Prisma.CollectionOrderByWithRelationInput = {};

    if (userId) {
      whereQuery.ownerId = userId;
    } else {
      whereQuery.mode = 'PUBLIC';
    }

    if (orderBy === 'new') {
      orderByQuery.createdAt = 'desc';
    }

    const collections = await prisma.collection.findMany({
      where: whereQuery,
      include: {
        _count: {
          select: {
            images: true,
          },
        },
        images: {
          select: {
            filepath: true,
            numVotes: true,
          },
          orderBy: {
            rating: 'desc',
          },
          take: 6,
        },
      },
      orderBy: orderByQuery,
    });

    const sumRes = await prisma.image.groupBy({
      by: ['collectionId'],
      _sum: {
        numVotes: true,
      },
    });

    const votesMap = sumRes.reduce(
      (acc, { collectionId, _sum }) => {
        acc[collectionId] = _sum.numVotes || 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    const res = collections.map(({ _count, images, ...collection }) => ({
      ...collection,
      totalImages: _count.images,
      totalVotes: votesMap[collection.id] || 0,
      thumbnailImages: images.map(({ filepath }) => filepath),
    }));

    if (orderBy === 'popular') {
      res.sort((a, b) => b.totalVotes - a.totalVotes);
    }

    return res;
  }

  async getOne(
    collectionId: string,
    {
      imagesSort,
    }: Partial<{ imagesSort: Prisma.ImageOrderByWithRelationInput }> = {},
  ) {
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
          },
          orderBy: imagesSort,
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection id ${collectionId} does not exist`,
      );
    }

    const totalImages = collection.images.length;
    const transformedCollection = {
      ...collection,
      images: collection.images.map(({ rating, ...image }, index) => ({
        ...image,
        percentile: (totalImages - index - 1) / (totalImages - 1),
      })),
    };

    return transformedCollection;
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

  async deleteOne(collectionId: string, userId: string) {
    return prisma.collection.delete({
      where: {
        id: collectionId,
        ownerId: userId,
      },
    });
  }
}

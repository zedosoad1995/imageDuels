import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/common/helpers/prisma';
import { CreateCollectionDto } from './dto/createCollection.dto';
import { Prisma } from '@prisma/client';
import { IGetCollections } from './collections.type';
import { EditCollectionDto } from './dto/editCollection.dto';

@Injectable()
export class CollectionsService {
  async getMany({ userId, orderBy, showAllModes, showNSFW }: IGetCollections) {
    const whereQuery: Prisma.CollectionWhereInput = {};
    const orderByQuery: Prisma.CollectionOrderByWithRelationInput = {};

    if (userId) {
      whereQuery.ownerId = userId;
    } else if (!showAllModes) {
      whereQuery.mode = 'PUBLIC';
      whereQuery.isLive = true;
    }

    if (!showNSFW) {
      whereQuery.isNSFW = false;
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
        owner: {
          select: {
            username: true,
          },
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

    const res = collections.map(({ _count, images, owner, ...collection }) => ({
      ...collection,
      createdBy: owner.username,
      totalImages: _count.images,
      totalVotes: votesMap[collection.id] || 0,
      thumbnailImages: images.map(({ filepath }) => filepath),
      isValid: this.isValid(_count.images),
    }));

    if (orderBy === 'popular') {
      res.sort((a, b) => b.totalVotes - a.totalVotes);
    }

    return res;
  }

  async getOne(
    collectionId: string,
    userId: string | undefined,
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
        percentile:
          totalImages > 1 ? (totalImages - index - 1) / (totalImages - 1) : 1,
      })),
      belongsToMe: collection.ownerId === userId,
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

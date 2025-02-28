import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/common/helpers/prisma';
import { CreateCollectionDto } from './dto/createCollection.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CollectionsService {
  async getMany(userId?: string) {
    const whereQuery: Prisma.CollectionWhereInput = {};

    if (userId) {
      whereQuery.ownerId = userId;
    } else {
      whereQuery.mode = 'PUBLIC';
    }

    return prisma.collection.findMany({
      where: whereQuery,
    });
  }

  async getOne(collectionId: string) {
    // TODO: Should not have rating desc like this, should improve
    const collection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
      },
      include: {
        images: {
          orderBy: {
            rating: 'desc',
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection id ${collectionId} does not exist`,
      );
    }

    return collection;
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

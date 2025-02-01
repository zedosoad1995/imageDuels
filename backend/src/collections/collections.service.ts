import { BadRequestException, Injectable } from '@nestjs/common';
import { prisma } from 'src/common/prisma';
import { CreateCollectionDto } from './dto/collections.dto';

@Injectable()
export class CollectionsService {
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
}

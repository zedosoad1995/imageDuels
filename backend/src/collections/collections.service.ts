import { Injectable } from '@nestjs/common';
import { prisma } from 'src/common/prisma';
import { CreateCollectionDto } from './dto/collections.dto';

@Injectable()
export class CollectionsService {
  create(collection: CreateCollectionDto, userId: string) {
    return prisma.collection.create({
      data: {
        ...collection,
        ownerId: userId,
      },
    });
  }
}

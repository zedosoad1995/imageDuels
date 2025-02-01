import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from 'src/common/prisma';
import {
  RATING_DEVIATION_INIT,
  RATING_INIT,
  VOLATILITY_INIT,
} from './constants/rating';

@Injectable()
export class ImagesService {
  async create(collectionId: string) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection id ${collectionId} does not exist`,
      );
    }

    // TODO: Add image upload and filepath

    return prisma.image.create({
      data: {
        filepath: '',
        rating: RATING_INIT,
        ratingDeviation: RATING_DEVIATION_INIT,
        volatility: VOLATILITY_INIT,
        collectionId,
      },
    });
  }
}

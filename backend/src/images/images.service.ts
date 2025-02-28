import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/common/prisma';
import {
  RATING_DEVIATION_INIT,
  RATING_INIT,
  VOLATILITY_INIT,
} from './constants/rating';
import { randInt } from 'src/common/helpers/random';
import { Image } from '@prisma/client';

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

    return prisma.image.create({
      data: {
        filepath: imageFile.filename,
        rating: RATING_INIT,
        ratingDeviation: RATING_DEVIATION_INIT,
        volatility: VOLATILITY_INIT,
        collectionId,
      },
    });
  }

  async getMatchImages(
    collectionId: string,
  ): Promise<[Pick<Image, 'id' | 'filepath'>, Pick<Image, 'id' | 'filepath'>]> {
    const images = await prisma.image.findMany({
      where: {
        collectionId,
      },
      select: {
        id: true,
        filepath: true,
      },
    });

    if (images.length < 2) {
      throw new BadRequestException('There are not enough images');
    }

    const image1 = images.splice(randInt(images.length - 1), 1)[0];
    const image2 = images[randInt(images.length - 1)];

    return [image1, image2];
  }
}

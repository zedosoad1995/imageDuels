import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/common/helpers/prisma';
import { RATING_INI, RD_INI, VOLATILITY_INI } from './constants/rating';
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
        rating: RATING_INI,
        ratingDeviation: RD_INI,
        volatility: VOLATILITY_INI,
        collectionId,
      },
    });
  }

  async getBulkMatchesImages(collectionIds: string[]) {
    return Promise.all(collectionIds.map(this.getMatchImages));
  }

  async getMatchImages(
    collectionId: string,
  ): Promise<
    [
      Pick<Image, 'id' | 'filepath' | 'numVotes'>,
      Pick<Image, 'id' | 'filepath' | 'numVotes'>,
    ]
  > {
    const images = await prisma.image.findMany({
      where: {
        collectionId,
      },
      select: {
        id: true,
        filepath: true,
        numVotes: true,
        rating: true,
      },
    });

    if (images.length < 2) {
      throw new BadRequestException('There are not enough images');
    }

    return this.randomImagesWithVotes(images);
  }

  private randomImages(
    images: {
      id: string;
      filepath: string;
      numVotes: number;
      rating: number;
    }[],
  ): [
    Pick<Image, 'id' | 'filepath' | 'numVotes' | 'rating'>,
    Pick<Image, 'id' | 'filepath' | 'numVotes' | 'rating'>,
  ] {
    const image1 = images.splice(randInt(images.length - 1), 1)[0];
    const image2 = images[randInt(images.length - 1)];

    return [image1, image2];
  }

  private randomImagesWithVotes(
    images: {
      id: string;
      filepath: string;
      numVotes: number;
      rating: number;
    }[],
  ): [
    Pick<Image, 'id' | 'filepath' | 'numVotes' | 'rating'>,
    Pick<Image, 'id' | 'filepath' | 'numVotes' | 'rating'>,
  ] {
    let image1: {
      id: string;
      filepath: string;
      numVotes: number;
      rating: number;
    };

    if (Math.random() < 0.2) {
      image1 = images.splice(randInt(images.length - 1), 1)[0];
    } else {
      const lowestVotes = images.reduce(
        (acc, val) => Math.min(acc, val.numVotes),
        99999999999,
      );
      const imageLowestVotesIdx = images.findIndex(
        ({ numVotes }) => numVotes === lowestVotes,
      );

      image1 = images.splice(imageLowestVotesIdx, 1)[0];
    }

    const sortedImages = images
      .slice()
      .sort(
        (a, b) =>
          Math.abs(a.rating - image1.rating) -
          Math.abs(b.rating - image1.rating),
      );

    const image2 = sortedImages[randInt(Math.min(sortedImages.length - 1, 10))];

    if (Math.random() < 0.5) {
      return [image2, image1];
    }

    return [image1, image2];
  }

  async deleteOne(imageId: string, userId: string, isAdmin: boolean) {
    const image = await prisma.image.findUnique({
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
      where: {
        id: imageId,
      },
    });
  }
}

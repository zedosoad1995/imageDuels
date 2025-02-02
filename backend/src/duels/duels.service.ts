import { Injectable } from '@nestjs/common';
import { prisma } from 'src/common/prisma';

@Injectable()
export class DuelsService {
  create(image1: string, image2: string, userId: string) {
    return prisma.duel.upsert({
      create: {
        image1Id: image1,
        image2Id: image2,
        activeUserId: userId,
        voterId: userId,
      },
      update: {
        image1Id: image1,
        image2Id: image2,
      },
      where: {
        activeUserId: userId,
        isFinished: false,
      },
    });
  }
}

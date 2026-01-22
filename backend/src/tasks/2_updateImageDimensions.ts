import { prisma } from '../common/helpers/prisma';
import { imageSize } from 'image-size';
import * as fs from 'node:fs';

const BATCH_SIZE = 500;

const run = async () => {
  let lastId: string | undefined;

  while (true) {
    const images = await prisma.image.findMany({
      select: {
        id: true,
        filepath: true,
      },
      where: {
        OR: [{ height: 0 }, { width: 0 }],
        id: lastId ? { gt: lastId } : undefined,
      },
      orderBy: {
        id: 'asc',
      },
      take: BATCH_SIZE,
    });

    lastId = images.at(-1)?.id;

    if (!images.length) {
      console.log('finish');
      return;
    }

    for (const { id, filepath } of images) {
      const fileBuffer = await fs.promises.readFile(`./uploads/${filepath}`);
      const { width, height } = imageSize(fileBuffer);

      try {
        await prisma.image.update({
          data: {
            width,
            height,
          },
          where: {
            id,
          },
        });
      } catch (err) {
        console.error(id, err);
      }
    }

    console.log('Updated', images.length);
  }
};

run();

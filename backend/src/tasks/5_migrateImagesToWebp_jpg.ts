// import { prisma } from '../common/helpers/prisma';
// import * as fsPromises from 'fs/promises';
// import * as path from 'path';
// import * as sharp from 'sharp';

// const BATCH_SIZE = 500;

// const MAX_DIM = 1920;
// const WEBP_QUALITY = 75;
// const JPEG_FALLBACK_QUALITY = 65;

// const MAX_INPUT_PIXELS = 120e6;

// const run = async () => {
//   let lastId: string | null = null;

//   while (true) {
//     const images = await prisma.image.findMany({
//       where: {
//         id: { gt: lastId ?? undefined },
//       },
//       take: BATCH_SIZE,
//       orderBy: {
//         id: 'asc',
//       },
//     });

//     if (images.length === 0) {
//       break;
//     }

//     for (const image of images) {
//       const filepath = path.join('./uploads', image.filepath);
//       const fallbackFilepath = image.fallbackFilepath
//         ? path.join('./uploads', image.fallbackFilepath)
//         : null;

//       if (filepath.endsWith('.svg')) {
//         console.log('Skip svg', image.id);
//         continue;
//       }

//       if (
//         filepath.endsWith('.webp') &&
//         fallbackFilepath &&
//         fallbackFilepath.endsWith('.jpg')
//       ) {
//         console.log('Skip webp jpg', image.id);
//         continue;
//       }

//       let pipeline = sharp(await fsPromises.readFile(filepath), {
//         failOnError: false,
//         limitInputPixels: MAX_INPUT_PIXELS,
//       });

//       pipeline = pipeline.resize(MAX_DIM, MAX_DIM, {
//         fit: 'inside',
//         withoutEnlargement: true,
//       });

//       if (!filepath.endsWith('.webp')) {
//         const webpBuf = await pipeline
//           .clone()
//           .webp({ quality: WEBP_QUALITY })
//           .toBuffer();

//         const newFilepath =
//           filepath.split('.').slice(0, -1).join('.') + '.webp';

//         await fsPromises.writeFile(newFilepath, webpBuf);
//         await fsPromises.unlink(filepath);

//         await prisma.image.update({
//           data: {
//             filepath:
//               image.filepath.split('.').slice(0, -1).join('.') + '.webp',
//           },
//           where: {
//             id: image.id,
//           },
//         });

//         console.log(
//           'Added filepath',
//           newFilepath,
//           'Removed',
//           filepath,
//           image.id,
//         );
//       }

//       const jpgBuf = await pipeline
//         .clone()
//         .jpeg({ quality: JPEG_FALLBACK_QUALITY, mozjpeg: true })
//         .toBuffer();

//       const newFallbackFilepath =
//         filepath.split('.').slice(0, -1).join('.') + '.jpg';

//       await fsPromises.writeFile(newFallbackFilepath, jpgBuf);

//       await prisma.image.update({
//         data: {
//           fallbackFilepath:
//             image.filepath.split('.').slice(0, -1).join('.') + '.jpg',
//         },
//         where: {
//           id: image.id,
//         },
//       });

//       console.log('Added filepath fallback', newFallbackFilepath, image.id);
//     }

//     lastId = images.at(-1)?.id;

//     if (!lastId) {
//       break;
//     }
//   }
// };

// run();

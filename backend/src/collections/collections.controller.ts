import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UsePipes,
  Param,
  Get,
  NotFoundException,
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
  HttpCode,
  Delete,
  UploadedFile,
  UseInterceptors,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateCollectionDto,
  createCollectionSchema,
} from './dto/createCollection.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { ImagesService } from 'src/images/images.service';
import {
  collectionResSchema,
  manyCollectionsResSchema,
} from './dto/collection.dto';
import { DuelsService } from 'src/duels/duels.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import {
  IGetCollectionOrderBy,
  IGetCollectionsOrderBy,
} from './collections.type';
import {
  EditCollectionDto,
  editCollectionSchema,
} from './dto/editCollection.dto';
import { unlink } from 'fs';
import { LoggedUser, UserId } from 'src/users/users.decorator';
import { CollectionModeEnum, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ProfileCompletedGuard } from 'src/users/guards/profileCompleted.guard';
import { pick } from 'src/common/helpers/general';

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);

const UPLOAD_FOLDER = './uploads';

@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly imagesService: ImagesService,
    private readonly duelsService: DuelsService,
  ) {}

  @Get('')
  async getMany(
    @LoggedUser({ fetchUser: true }) user: User | null,
    @Query('onlySelf', new DefaultValuePipe(false), ParseBoolPipe)
    onlySelf: boolean,
    @Query('orderBy', new DefaultValuePipe('new'))
    orderBy: IGetCollectionsOrderBy,
    @Query('search')
    search: string | undefined,
    @Query('cursor') cursor?: string,
    @Query('mode') mode?: CollectionModeEnum,
  ) {
    const { collections, nextCursor } = await this.collectionsService.getMany({
      onlySelf,
      userId: onlySelf ? user?.id : undefined,
      showNSFW: user?.canSeeNSFW,
      showAllModes: user?.role === 'ADMIN' && !mode,
      mode,
      orderBy,
      search,
      cursor,
    });

    return {
      collections: manyCollectionsResSchema.parse(collections),
      nextCursor,
    };
  }

  @Get(':collectionId')
  async getOne(
    @LoggedUser({ fetchUser: true }) user: User | null,
    @Param('collectionId') collectionId: string,
    @Query('orderBy', new DefaultValuePipe('best-rated'))
    orderBy: IGetCollectionOrderBy,
    @Query('cursor') cursor?: string,
  ) {
    const collection = await this.collectionsService.getOne(
      collectionId,
      orderBy,
      user?.id,
      cursor,
    );

    const isPersonalFromOtherUser =
      user?.role !== 'ADMIN' &&
      collection.mode === 'PERSONAL' &&
      collection.ownerId !== user?.id;

    const isNotReadyToBeSeenByOthers =
      user?.role !== 'ADMIN' &&
      collection.ownerId !== user?.id &&
      (!collection.isLive ||
        !this.collectionsService.isValid(collection.numImages));

    const isNSFWAndUserIsAGoodBoy =
      (!user || !user?.canSeeNSFW) && collection.isNSFW;

    if (
      isPersonalFromOtherUser ||
      isNotReadyToBeSeenByOthers ||
      isNSFWAndUserIsAGoodBoy
    ) {
      throw new NotFoundException(
        `Collection id ${collectionId} does not exist`,
      );
    }

    return collectionResSchema.parse({
      ...collection,
      isValid: this.collectionsService.isValid(collection.images.length),
    });
  }

  @Get('me/stats')
  async getMeStats(@UserId() userId: string) {
    return this.collectionsService.getMyStats(userId);
  }

  @UseGuards(AuthGuard(true), ProfileCompletedGuard)
  @UsePipes(new ZodValidationPipe(createCollectionSchema))
  @Post('')
  create(@Body() createCollectionDto: CreateCollectionDto, @Request() req) {
    return this.collectionsService.create(createCollectionDto, req.user.id);
  }

  @UseGuards(AuthGuard(true), ProfileCompletedGuard)
  @UsePipes(new ZodValidationPipe(editCollectionSchema))
  @Patch(':collectionId')
  edit(
    @Param('collectionId') collectionId: string,
    @Body() editCollectionDto: EditCollectionDto,
    @LoggedUser({ getTokenFromHeader: true }) loggedUser: User,
  ) {
    return this.collectionsService.edit(
      collectionId,
      editCollectionDto,
      loggedUser.id,
      loggedUser.role === 'ADMIN',
    );
  }

  @UseGuards(AuthGuard(true), ProfileCompletedGuard)
  @Post(':collectionId/add-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB cap (tune)
      },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIMES.has(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Unsupported type: ${file.mimetype}`,
            ) as any,
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  addImage(
    @Param('collectionId') collectionId: string,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.imagesService.create(collectionId, imageFile);
  }

  @Get(':collectionId/duels')
  async getDuel(
    @LoggedUser({ fetchUser: true }) user: User | null,
    @Param('collectionId') collectionId: string,
  ) {
    const [image1, image2] = await this.imagesService.getMatchImages(
      collectionId,
      user?.id,
      user?.role === 'ADMIN',
    );

    let token: string | undefined;

    if (user?.id) {
      token = await this.duelsService.generateToken(image1.id, image2.id);
    }

    return {
      token,
      image1: pick(image1, [
        'availableFormats',
        'availableWidths',
        'filepath',
        'hasPlaceholder',
        'isSvg',
      ]),
      image2: pick(image2, [
        'availableFormats',
        'availableWidths',
        'filepath',
        'hasPlaceholder',
        'isSvg',
      ]),
    };
  }

  @UseGuards(AuthGuard(true), ProfileCompletedGuard)
  @Delete(':collectionId')
  @HttpCode(204)
  async deleteOne(
    @LoggedUser({ getTokenFromHeader: true }) loggedUser: User,
    @Param('collectionId') collectionId: string,
  ) {
    let collection: {
      images: {
        filepath: string;
      }[];
    };

    try {
      collection = await this.collectionsService.deleteOne(
        collectionId,
        loggedUser.id,
        loggedUser.role === 'ADMIN',
      );
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Collection not found');
      }

      throw error;
    }

    collection.images.forEach(({ filepath }) => {
      unlink(UPLOAD_FOLDER + '/' + filepath, (error) => {
        if (!error) return;

        console.error(
          'Error trying to delete file in  ' +
            UPLOAD_FOLDER +
            '/' +
            filepath +
            ':' +
            error,
        );
      });
    });
  }
}

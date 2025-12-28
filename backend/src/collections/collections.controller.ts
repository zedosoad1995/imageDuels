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
import { diskStorage } from 'multer';
import { IGetCollectionsOrderBy } from './collections.type';
import {
  EditCollectionDto,
  editCollectionSchema,
} from './dto/editCollection.dto';
import { unlink } from 'fs';
import { generateRandomString } from 'src/common/helpers/random';
import { LoggedUser, UserId } from 'src/users/users.decorator';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ProfileCompletedGuard } from 'src/users/guards/profileCompleted.guard';

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
  ) {
    const collections = await this.collectionsService.getMany({
      onlySelf,
      userId: onlySelf ? user?.id : undefined,
      showNSFW: user?.canSeeNSFW,
      showAllModes: user?.role === 'ADMIN',
      orderBy,
      search,
    });

    return manyCollectionsResSchema.parse(collections);
  }

  @Get(':collectionId')
  async getOne(
    @LoggedUser({ fetchUser: true }) user: User | null,
    @Param('collectionId') collectionId: string,
    @Query('cursor') cursor?: string,
  ) {
    const collection = await this.collectionsService.getOne(
      collectionId,
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
        !this.collectionsService.isValid(collection.images.length));

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
      storage: diskStorage({
        destination: UPLOAD_FOLDER,
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          cb(null, `${Date.now()}-${generateRandomString(12)}.${ext}`);
        },
      }),
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
    @UserId() userId: string | undefined,
    @Param('collectionId') collectionId: string,
  ) {
    const [image1, image2] =
      await this.imagesService.getMatchImages(collectionId);

    let token: string | undefined;

    if (userId) {
      token = await this.duelsService.generateToken(image1.id, image2.id);
    }

    return { token, image1: image1.filepath, image2: image2.filepath };
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

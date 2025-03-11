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
import { AuthGuard } from 'src/auth/auth.guards';
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
    @Request() req,
    @Query('onlySelf', new DefaultValuePipe(false), ParseBoolPipe)
    onlySelf: boolean,
    @Query('orderBy', new DefaultValuePipe('new'))
    orderBy: IGetCollectionsOrderBy,
  ) {
    const collections = await this.collectionsService.getMany({
      userId: onlySelf ? req.user.id : undefined,
      orderBy,
    });

    return manyCollectionsResSchema.parse(collections);
  }

  @Get(':collectionId')
  async getOne(@Request() req, @Param('collectionId') collectionId: string) {
    const collection = await this.collectionsService.getOne(
      collectionId,
      req.user?.id,
      {
        imagesSort: { rating: 'desc' },
      },
    );

    // TODO: Make admin be able to see the collection
    if (
      collection?.mode === 'PERSONAL' &&
      collection?.ownerId !== req.user.id
    ) {
      throw new NotFoundException(
        `Collection id ${collectionId} does not exist`,
      );
    }

    return collectionResSchema.parse(collection);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createCollectionSchema))
  @Post('')
  create(@Body() createCollectionDto: CreateCollectionDto, @Request() req) {
    return this.collectionsService.create(createCollectionDto, req.user.id);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(editCollectionSchema))
  @Patch(':collectionId')
  edit(
    @Param('collectionId') collectionId: string,
    @Body() editCollectionDto: EditCollectionDto,
    @Request() req,
  ) {
    return this.collectionsService.edit(
      collectionId,
      editCollectionDto,
      req.user.id,
    );
  }

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Post(':collectionId/duels')
  async createDuel(
    @Request() req,
    @Param('collectionId') collectionId: string,
  ) {
    const [image1, image2] =
      await this.imagesService.getMatchImages(collectionId);

    const { id } = await this.duelsService.create(
      image1.id,
      image2.id,
      req.user.id,
    );

    return { duelId: id, image1: image1.filepath, image2: image2.filepath };
  }

  @UseGuards(AuthGuard)
  @Delete(':collectionId')
  @HttpCode(204)
  async deleteOne(@Request() req, @Param('collectionId') collectionId: string) {
    const collection = await this.collectionsService.deleteOne(
      collectionId,
      req.user.id,
    );

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

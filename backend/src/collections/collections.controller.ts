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

@UseGuards(AuthGuard)
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
    const collection = await this.collectionsService.getOne(collectionId, {
      imagesSort: { rating: 'desc' },
    });

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

  @UsePipes(new ZodValidationPipe(createCollectionSchema))
  @Post('')
  create(@Body() createCollectionDto: CreateCollectionDto, @Request() req) {
    return this.collectionsService.create(createCollectionDto, req.user.id);
  }

  @Post(':collectionId/add-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          cb(null, `${Date.now()}.${ext}`);
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

  @Delete(':collectionId')
  @HttpCode(204)
  deleteOne(@Request() req, @Param('collectionId') collectionId: string) {
    return this.collectionsService.deleteOne(collectionId, req.user.id);
  }
}

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

@UseGuards(AuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly imagesService: ImagesService,
  ) {}

  @Get('')
  async getMany(
    @Request() req,
    @Query('onlySelf', new DefaultValuePipe(false), ParseBoolPipe)
    onlySelf: boolean,
  ) {
    const collections = await this.collectionsService.getMany(
      onlySelf ? req.user.id : undefined,
    );

    return manyCollectionsResSchema.parse(collections);
  }

  @Get(':collectionId')
  async getOne(@Request() req, @Param('collectionId') collectionId: string) {
    const collection = await this.collectionsService.getOne(collectionId);

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
  addImage(@Param('collectionId') collectionId: string) {
    return this.imagesService.create(collectionId);
  }

  @Delete(':collectionId')
  @HttpCode(204)
  deleteOne(@Request() req, @Param('collectionId') collectionId: string) {
    return this.collectionsService.deleteOne(collectionId, req.user.id);
  }
}

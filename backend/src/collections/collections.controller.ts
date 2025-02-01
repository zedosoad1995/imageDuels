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
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { AuthGuard } from 'src/auth/auth.guards';
import {
  CreateCollectionDto,
  createCollectionSchema,
} from './dto/collections.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { ImagesService } from 'src/images/images.service';

@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly imagesService: ImagesService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('')
  getMany(
    @Request() req,
    @Query('onlySelf', new DefaultValuePipe(false), ParseBoolPipe)
    onlySelf: boolean,
  ) {
    return this.collectionsService.getMany(onlySelf ? req.user.id : undefined);
  }

  @UseGuards(AuthGuard)
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

    // TODO: serialize, or transform what is necessary
    return collection;
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createCollectionSchema))
  @Post('')
  create(@Body() createCollectionDto: CreateCollectionDto, @Request() req) {
    return this.collectionsService.create(createCollectionDto, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post(':collectionId/add-image')
  addImage(@Param('collectionId') collectionId: string) {
    return this.imagesService.create(collectionId);
  }
}

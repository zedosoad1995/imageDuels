import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UsePipes,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { AuthGuard } from 'src/auth/auth.guards';
import {
  CreateCollectionDto,
  createCollectionSchema,
} from './dto/collections.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createCollectionSchema))
  @Post('')
  create(@Body() createCollectionDto: CreateCollectionDto, @Request() req) {
    console.log(req.user);
    return this.collectionsService.create(createCollectionDto, req.user.id);
  }
}

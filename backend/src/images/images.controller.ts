import {
  Controller,
  Delete,
  HttpCode,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { unlink } from 'fs';
import { AuthGuard } from 'src/auth/auth.guards';
import { User } from '@prisma/client';
import { LoggedUser } from 'src/users/users.decorator';

const UPLOAD_FOLDER = './uploads';

@UseGuards(AuthGuard)
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Delete(':imageId')
  @HttpCode(204)
  async deleteOne(@LoggedUser() user: User, @Param('imageId') imageId: string) {
    const image = await this.imagesService.deleteOne(
      imageId,
      user.id,
      user.role === 'ADMIN',
    );

    unlink(UPLOAD_FOLDER + '/' + image.filepath, (error) => {
      if (!error) return;

      console.error(
        'Error trying to delete file (delete image endpoint) in  ' +
          UPLOAD_FOLDER +
          '/' +
          image.filepath +
          ':' +
          error,
      );
    });
  }
}

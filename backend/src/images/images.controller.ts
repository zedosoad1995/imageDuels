import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ImagesService } from './images.service';
import { unlink } from 'fs';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from '@prisma/client';
import { LoggedUser } from 'src/users/users.decorator';
import { ProfileCompletedGuard } from 'src/users/guards/profileCompleted.guard';

const UPLOAD_FOLDER = './uploads';

@UseGuards(AuthGuard(true), ProfileCompletedGuard)
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Delete(':imageId')
  @HttpCode(204)
  async deleteOne(
    @LoggedUser({ fetchUser: true }) user: User,
    @Param('imageId') imageId: string,
  ) {
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

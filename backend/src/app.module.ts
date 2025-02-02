import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CollectionsController } from './collections/collections.controller';
import { CollectionsService } from './collections/collections.service';
import { CollectionsModule } from './collections/collections.module';
import { ImagesModule } from './images/images.module';
import { DuelsModule } from './duels/duels.module';

@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot(), CollectionsModule, ImagesModule, DuelsModule],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class AppModule {}

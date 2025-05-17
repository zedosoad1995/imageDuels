import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema } from './dto/createUser.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { getMeSchema } from './dto/getMe.dto';
import { LoggedUser, UserId } from './users.decorator';
import { AuthGuard } from 'src/auth/auth.guards';
import { EditUserDto, editUserSchema } from './dto/editUser.dto';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@UserId() userId) {
    if (!userId) {
      throw new NotFoundException('User is not logged in');
    }

    const loggedUser = await this.usersService.getOne({
      id: userId,
    });

    if (!loggedUser) {
      throw new UnauthorizedException();
    }

    return getMeSchema.parse(loggedUser);
  }

  @Patch('complete-registration')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async completeRegistration(
    @Body() createUserDto: CreateUserDto,
    @UserId({ getTokenFromHeader: true }) loggedUserId: string,
  ) {
    const user = await this.usersService.edit(createUserDto, loggedUserId);

    return getMeSchema.parse(user);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(editUserSchema))
  @Patch('me')
  async edit(
    @Body() editUserDto: EditUserDto,
    @UserId({ getTokenFromHeader: true }) loggedUserId: string,
  ) {
    const user = await this.usersService.edit(editUserDto, loggedUserId);

    return getMeSchema.parse(user);
  }

  @UseGuards(AuthGuard)
  @HttpCode(204)
  @Delete('me')
  async deleteMe(@LoggedUser({ getTokenFromHeader: true }) LoggedUser: User) {
    if (LoggedUser.role === 'ADMIN') {
      throw new BadRequestException('User cannot delete itself');
    }

    await this.usersService.deleteOne(LoggedUser.id);
  }
}

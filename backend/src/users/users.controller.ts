import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema } from './dto/createUser.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { getMeSchema } from './dto/getMe.dto';
import { UserId } from './users.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@UserId() userId) {
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

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

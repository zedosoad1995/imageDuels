import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema } from './dto/createUser.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { AuthGuard } from 'src/auth/auth.guards';
import { LoggedUser } from './users.decorator';
import { User } from '@prisma/client';
import { getMeSchema } from './dto/getMe.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@LoggedUser() user: User) {
    return getMeSchema.parse(user);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

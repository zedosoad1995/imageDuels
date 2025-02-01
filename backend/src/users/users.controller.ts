import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema } from './dto/users.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { AuthGuard } from 'src/auth/auth.guards';
import { LoggedUser } from './users.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@LoggedUser() user) {
    // TODO: Do not return password (use serialization)
    return user;
  }
}

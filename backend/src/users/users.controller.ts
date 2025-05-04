import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
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
import { UserId } from './users.decorator';
import { AuthGuard } from 'src/auth/auth.guards';
import { EditUserDto, editUserSchema } from './dto/editUser.dto';

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

  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(editUserSchema))
  @Patch('me')
  edit(
    @Body() editUserDto: EditUserDto,
    @UserId({ getTokenFromHeader: true }) loggedUserId: string,
  ) {
    return this.usersService.edit(editUserDto, loggedUserId);
  }
}

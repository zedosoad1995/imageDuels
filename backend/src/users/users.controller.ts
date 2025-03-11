import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema } from './dto/createUser.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { getMeSchema } from './dto/getMe.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Get('me')
  async getProfile(@Request() req) {
    const token = req.cookies?.token;
    if (!token) {
      throw new NotFoundException('User is not logged in');
    }

    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_KEY,
    });

    const loggedUser = await this.usersService.getOne({
      id: payload.user?.id,
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

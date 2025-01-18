import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/users.dto';
import { prisma } from 'src/common/prisma';

@Injectable()
export class UsersService {
  create(user: CreateUserDto) {
    return prisma.user.create({
      data: user,
    });
  }
}

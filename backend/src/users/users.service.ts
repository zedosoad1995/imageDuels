import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { prisma } from 'src/common/prisma';
import { hashPassword } from 'src/common/helpers/password';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  async getOne(whereQuery: Prisma.UserWhereUniqueInput) {
    return prisma.user.findUnique({
      where: whereQuery,
    });
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const existingUser = await this.getOne({ email });
    return !!existingUser;
  }

  async create(user: CreateUserDto) {
    if (await this.isEmailTaken(user.email)) {
      throw new BadRequestException('Email already in use');
    }

    return prisma.user.create({
      data: {
        email: user.email,
        password: await hashPassword(user.password),
      },
    });
  }
}

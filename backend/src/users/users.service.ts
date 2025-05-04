import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { prisma } from 'src/common/helpers/prisma';
import { hashPassword } from 'src/common/helpers/password';
import { Prisma } from '@prisma/client';
import { EditUserDto } from './dto/editUser.dto';

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

  async isUsernameTaken(username: string): Promise<boolean> {
    const existingUser = await this.getOne({ username });
    return !!existingUser;
  }

  // TODO: maybe return the 2 errors, if both exist. Could also be done in call, but may not be necessary to optimize this
  async create(user: CreateUserDto) {
    if (await this.isEmailTaken(user.email)) {
      throw new BadRequestException('Email already in use');
    }

    if (await this.isUsernameTaken(user.username)) {
      throw new BadRequestException('Username already in use');
    }

    return prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: await hashPassword(user.password),
      },
    });
  }

  async edit(userEditBody: EditUserDto, userId: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: userEditBody,
    });
  }

  async deleteOne(userId: string) {
    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}

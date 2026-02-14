import { Injectable } from '@nestjs/common';
import { prisma } from 'src/common/helpers/prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  async getOneByGoogleLogin({
    googleId,
    email,
  }: {
    googleId: string;
    email: string;
  }) {
    return prisma.user.findUnique({
      where: {
        googleId,
        email,
      },
    });
  }

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

  async createIncompleteGoogleProfile(data: {
    googleId: string;
    email: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async edit(userEditBody: Prisma.UserUpdateInput, userId: string) {
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

  async ban(banUserId: string) {
    return prisma.user.update({
      data: {
        isBanned: true
      },
      where: {
        id: banUserId
      }
    });
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/users.dto';
import { prisma } from 'src/common/prisma';
import { hashPassword } from 'src/common/password';

@Injectable()
export class UsersService {
  async isEmailTaken(email: string): Promise<boolean> {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    return !!existingUser;
  }

  async create(user: CreateUserDto) {
    if (await this.isEmailTaken(user.email)) {
      throw new BadRequestException('Email already in use.');
    }

    return prisma.user.create({
      data: {
        email: user.email,
        password: await hashPassword(user.password),
      },
    });
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/auth.dto';
import { checkPassword } from 'src/common/helpers/password';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login({ usernameOrEmail, password }: LoginDto) {
    const whereQuery: Prisma.UserWhereUniqueInput =
      {} as Prisma.UserWhereUniqueInput;

    if (usernameOrEmail.includes('@')) {
      whereQuery.email = usernameOrEmail;
    } else {
      whereQuery.username = usernameOrEmail;
    }

    const user = await this.usersService.getOne(whereQuery);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (!(await checkPassword(password, user.password))) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    return {
      token: this.jwtService.signAsync({ user: { id: user.id } }),
      user,
    };
  }
}

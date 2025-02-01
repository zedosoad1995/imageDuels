import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/auth.dto';
import { checkPassword } from 'src/common/helpers/password';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.getOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (!(await checkPassword(password, user.password))) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const token = await this.jwtService.signAsync({ user: { id: user.id } });

    return { token };
  }
}

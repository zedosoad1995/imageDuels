import {
  UnauthorizedException,
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { LoginDto, LoginSchema } from './dto/auth.dto';
import { checkPasswords } from 'src/common/password';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() loginDto: LoginDto) {
    const user = await this.usersService.getOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (!(await checkPasswords(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const token = this.authService.generateJWT(user.email);

    return { token };
  }
}

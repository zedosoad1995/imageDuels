import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { LoginDto, LoginSchema } from './dto/auth.dto';
import { Response } from 'express';
import { getMeSchema } from 'src/users/dto/getMe.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    const { token, user } = await this.authService.login(loginDto);

    // TODO: do not forget to use NODE_ENV prod in production, otherwise it will not be secure
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'strict',
    });

    return getMeSchema.parse(user);
  }

  @Post('logout')
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async logout(@Res({ passthrough: true }) res: Response) {
    // TODO: do not forget to use NODE_ENV prod in production, otherwise it will not be secure
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'strict',
    });
  }
}

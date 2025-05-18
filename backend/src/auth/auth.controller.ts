import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation';
import { LoginSchema } from './dto/auth.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';

interface GoogleRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // starts OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    const googleUser = req.user;

    let user = await this.usersService.getOneByGoogleLogin({
      googleId: googleUser.id,
      email: googleUser.email,
    });

    if (!user) {
      user = await this.usersService.createIncompleteGoogleProfile({
        googleId: googleUser.id,
        email: googleUser.email,
      });
    }

    const token = await this.authService.generateJWT(user);

    // TODO: do not forget to use NODE_ENV prod in production, otherwise it will not be secure
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'strict',
    });

    return res.redirect(process.env.FRONTEND_URL as string);
  }
}

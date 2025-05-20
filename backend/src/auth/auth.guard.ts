import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from 'src/common/helpers/prisma';

const logger = new Logger('Auth Guards');

export const AuthGuard = (fetchUser: boolean = false): Type<CanActivate> => {
  @Injectable()
  class TempAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = request.cookies?.token;
      if (!token) {
        throw new UnauthorizedException('No token found in cookies');
      }

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_KEY,
        });

        if (fetchUser) {
          if (!payload.user?.id) {
            throw new UnauthorizedException();
          }

          const loggedUser = await prisma.user.findUnique({
            where: {
              id: payload.user.id,
            },
          });

          request['user'] = loggedUser;
        } else {
          request['user'] = payload.user;
        }
      } catch (error) {
        logger.error(error);
        throw new UnauthorizedException();
      }

      return true;
    }
  }

  return mixin(TempAuthGuard);
};

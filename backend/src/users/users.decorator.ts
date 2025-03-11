import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from 'src/common/helpers/prisma';

const logger = new Logger('Users Decorators');

export const LoggedUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      logger.error(
        `request.user should exist and have the field "id", but is: ${JSON.stringify(user)}`,
      );
      throw new UnauthorizedException();
    }

    const loggedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!loggedUser) {
      logger.error(`User id does not exist: ${user.id}`);
      throw new UnauthorizedException();
    }

    return loggedUser;
  },
);

export const UserId = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<string | undefined> => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.cookies?.token;

    try {
      const payload = await new JwtService().verifyAsync(token, {
        secret: process.env.JWT_KEY,
      });

      return payload?.user?.id;
    } catch {
      return;
    }
  },
);

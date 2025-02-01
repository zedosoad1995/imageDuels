import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from 'src/common/prisma';

export const LoggedUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.email) {
      throw new UnauthorizedException();
    }

    const loggedUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!loggedUser) {
      throw new UnauthorizedException();
    }

    return loggedUser;
  },
);

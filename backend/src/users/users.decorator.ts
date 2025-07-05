import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from 'src/common/helpers/prisma';

// TODO: if this is working. getTokenFromHeader necessary?
export const LoggedUser = createParamDecorator(
  async (
    {
      getTokenFromHeader,
      fetchUser,
    }: { getTokenFromHeader?: boolean; fetchUser?: boolean } = {
      getTokenFromHeader: false,
      fetchUser: false,
    },
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();

    if (getTokenFromHeader) {
      try {
        if (fetchUser) {
          const loggedUser = await prisma.user.findUnique({
            where: {
              id: request.user?.id,
            },
          });
          return loggedUser;
        }

        return request.user;
      } catch {
        return;
      }
    }

    const token = request.cookies?.token;

    try {
      const payload = await new JwtService().verifyAsync(token, {
        secret: process.env.JWT_KEY,
      });

      const loggedUser = await prisma.user.findUnique({
        where: {
          id: payload?.user?.id,
        },
      });

      return loggedUser;
    } catch {
      // TODO: do some logging? Also do it in the others
      return;
    }
  },
);

export const UserId = createParamDecorator(
  async (
    { getTokenFromHeader }: { getTokenFromHeader?: boolean } = {
      getTokenFromHeader: false,
    },
    ctx: ExecutionContext,
  ): Promise<string | undefined> => {
    const request = ctx.switchToHttp().getRequest();

    if (getTokenFromHeader) {
      return request.user.id;
    }

    const token = request.cookies?.token;

    try {
      const payload = await new JwtService().verifyAsync(token, {
        secret: process.env.JWT_KEY,
      });

      return payload?.user?.id;
    } catch (err) {
      console.error(err);
      return;
    }
  },
);

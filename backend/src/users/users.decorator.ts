import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from 'src/common/helpers/prisma';

// TODO: pass data to indicate if endpoint comes from auth guard, in this case can just reuse request.user

export const LoggedUser = createParamDecorator(
  async (
    { getTokenFromHeader }: { getTokenFromHeader: boolean } = {
      getTokenFromHeader: false,
    },
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();

    if (getTokenFromHeader) {
      try {
        const loggedUser = await prisma.user.findUnique({
          where: {
            id: request.user?.id,
          },
        });
        return loggedUser;
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

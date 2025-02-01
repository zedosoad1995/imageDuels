import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from 'src/common/prisma';

const logger = new Logger('Users Decorators');

export const LoggedUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      logger.error(
        `request.user should exist and have the field "id", but is: ${user}`,
      );
      throw new UnauthorizedException();
    }

    const loggedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!loggedUser) {
      logger.error(`This user id does not exist: ${user.id}`);
      throw new UnauthorizedException();
    }

    return loggedUser;
  },
);

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';

@Injectable()
export class isAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    return request.user?.role === RoleEnum.ADMIN;
  }
}

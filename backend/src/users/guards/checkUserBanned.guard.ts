import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
  } from '@nestjs/common';
  
  @Injectable()
  export class CheckUserBannedGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
  
      if (!request.user || !request.user.isProfileCompleted) {
        throw new ForbiddenException('Complete your profile first');
      }
  
      return true;
    }
  }
  
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './common/google.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '2d' },
    }),
    PassportModule,
  ],
})
export class AuthModule {}

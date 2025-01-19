import jwt from 'jsonwebtoken';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  generateJWT(email: string) {
    return jwt.sign(
      {
        email,
      },
      process.env.JWT_KEY!,
    );
  }
}

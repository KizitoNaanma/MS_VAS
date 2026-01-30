import { Injectable } from '@nestjs/common';
import { verify, sign } from 'jsonwebtoken';
import {
  JWT_REFRESH_SECRET_KEY,
  JWT_SECRET_KEY,
  TokenTypeEnum,
} from 'src/common';

@Injectable()
export class JwtUtilsService {
  async sign(
    payload: Record<string, any>,
    expiresIn: number,
    type?: TokenTypeEnum,
  ) {
    const cPayload = payload;
    delete cPayload.exp;

    switch (type) {
      case TokenTypeEnum.ACCESS:
        return sign(cPayload, JWT_SECRET_KEY, {
          expiresIn,
        });

      case TokenTypeEnum.REFRESH:
        return sign(cPayload, JWT_REFRESH_SECRET_KEY, {
          expiresIn,
        });

      default:
        return sign(cPayload, JWT_SECRET_KEY, {
          expiresIn,
        });
    }
  }

  async verify(token: string, type?: TokenTypeEnum) {
    switch (type) {
      case TokenTypeEnum.ACCESS:
        return verify(token, JWT_SECRET_KEY);

      case TokenTypeEnum.REFRESH:
        return verify(token, JWT_REFRESH_SECRET_KEY);

      default:
        return verify(token, JWT_SECRET_KEY);
    }
  }
}

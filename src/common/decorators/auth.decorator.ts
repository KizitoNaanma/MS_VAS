import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants';

export const AuthorizationRequired = () =>
  SetMetadata(METADATA_KEYS.ACCESS_TOKEN_REQUIRED, true);
export const RefreshAuthorization = () =>
  SetMetadata(METADATA_KEYS.REFRESH_TOKEN_REQUIRED, true);

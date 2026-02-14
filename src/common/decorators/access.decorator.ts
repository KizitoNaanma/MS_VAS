import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants';


export const SubscriptionRequired = () =>
  SetMetadata(METADATA_KEYS.REQUIRES_SUBSCRIPTION_KEY, true);

export const RequiresAdminRole = () =>
  SetMetadata(METADATA_KEYS.REQUIRES_ADMIN_ROLE, true);

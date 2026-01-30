import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants';

export const ReligionMustMatch = () =>
  SetMetadata(METADATA_KEYS.RELIGION_MUST_MATCH_KEY, true);

export const SubscriptionRequired = () =>
  SetMetadata(METADATA_KEYS.REQUIRES_SUBSCRIPTION_KEY, true);

export const RequiresAdminRole = () =>
  SetMetadata(METADATA_KEYS.REQUIRES_ADMIN_ROLE, true);

// The purpose of creating these constants is to avoid hardcoding the values of the religions in the seeders.
// and for file colocation purposes, we put them in the prisma folder.
// because prisma can't import from the common folder when it's not called from the nestjs context

export const SeedChristianReligion = {
  name: 'Christianity',
  noun: 'Christianity',
  adjective: 'Christian',
  code: 'christianity',
} as const;

export const SeedIslamReligion = {
  name: 'Islam',
  noun: 'Islam',
  adjective: 'Islamic',
  code: 'islam',
} as const;

export const SeedReligions = [
  SeedChristianReligion,
  SeedIslamReligion,
] as const;

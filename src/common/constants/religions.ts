export const ChristianReligion = {
  name: 'Christianity',
  noun: 'Christianity',
  adjective: 'Christian',
  code: 'christianity',
} as const;

export const IslamReligion = {
  name: 'Islam',
  noun: 'Islam',
  adjective: 'Islamic',
  code: 'islam',
} as const;

export const Religions = [ChristianReligion, IslamReligion] as const;

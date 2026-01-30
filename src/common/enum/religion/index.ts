export enum ReligionEnum {
  CHRISTIANITY = 'christianity',
  ISLAM = 'islam',
}

export function getReligionEnum(religion: string): ReligionEnum {
  const normalizedReligion = religion.toLowerCase();
  if (
    Object.values(ReligionEnum).includes(normalizedReligion as ReligionEnum)
  ) {
    return normalizedReligion as ReligionEnum;
  }
  throw new Error('Invalid religion value');
}

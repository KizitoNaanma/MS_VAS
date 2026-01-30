import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { CreateThemeDto } from '../../../generated/create-theme.dto';
import { SeedChristianReligion } from '../../../constants';

const prisma = new PrismaClient();

export default async function seedChristianThemes() {
  // create an array to hold the parsed JSON objects
  const themes: CreateThemeDto[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/themes/christian/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    themes.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religion = await prisma.religion.findFirst({
      where: {
        code: SeedChristianReligion.code,
      },
    });
    await prisma.theme.createMany({
      data: themes.map((theme) => ({
        ...theme,
        religionId: religion.id,
      })),
      skipDuplicates: true,
    });
  });
}

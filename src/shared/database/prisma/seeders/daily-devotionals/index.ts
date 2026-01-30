import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();

type RawDailyDevotionalData = {
  id: number;
  content: string;
  theme: string;
  religion: string;
};

type ProcessedDailyDevotionalData = Omit<
  RawDailyDevotionalData,
  'id' | 'theme' | 'religion'
> & {
  dayId: number;
  themeId: string;
  religionId: string;
};

export default async function seedDailyDevotionals() {
  // create an array to hold the parsed JSON objects
  const dailyDevotionalsRaw: RawDailyDevotionalData[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/daily-devotionals/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    dailyDevotionalsRaw.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religions = await prisma.religion.findMany();
    const themes = await prisma.theme.findMany();

    const dailyDevotionalsProcessed: ProcessedDailyDevotionalData[] =
      dailyDevotionalsRaw.map((dailyDevotional) => {
        const religion = religions.find(
          (religion) => religion.code === dailyDevotional.religion,
        );
        const theme = themes.find(
          (theme) => theme.code === dailyDevotional.theme,
        );

        return {
          dayId: dailyDevotional.id,
          themeId: theme.id,
          religionId: religion.id,
          content: dailyDevotional.content,
        };
      });

    await prisma.dailyDevotional.createMany({
      data: dailyDevotionalsProcessed,
      skipDuplicates: true,
    });
  });
}

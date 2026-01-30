import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();

type RawDailyPrayerData = {
  id: number;
  content: string;
  theme: string;
  religion: string;
};

type ProcessedDailyPrayerData = Omit<
  RawDailyPrayerData,
  'id' | 'theme' | 'religion'
> & {
  dayId: number;
  themeId: string;
  religionId: string;
};

export default async function seedDailyPrayers() {
  // create an array to hold the parsed JSON objects
  const dailyPrayersRaw: RawDailyPrayerData[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/daily-prayers/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    dailyPrayersRaw.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religions = await prisma.religion.findMany();
    const themes = await prisma.theme.findMany();

    const dailyPrayersProcessed: ProcessedDailyPrayerData[] =
      dailyPrayersRaw.map((dailyPrayer) => {
        const religion = religions.find(
          (religion) => religion.code === dailyPrayer.religion,
        );
        const theme = themes.find((theme) => theme.code === dailyPrayer.theme);

        return {
          dayId: dailyPrayer.id,
          themeId: theme.id,
          religionId: religion.id,
          content: dailyPrayer.content,
        };
      });

    await prisma.dailyPrayer.createMany({
      data: dailyPrayersProcessed,
      skipDuplicates: true,
    });
  });
}

import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();

type RawDailyScriptureData = {
  id: number;
  content: string;
  theme: string;
  religion: string;
};

type ProcessedDailyScriptureData = Omit<
  RawDailyScriptureData,
  'id' | 'theme' | 'religion'
> & {
  dayId: number;
  themeId: string;
  religionId: string;
};

export default async function seedDailyScriptures() {
  // create an array to hold the parsed JSON objects
  const dailyScripturesRaw: RawDailyScriptureData[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/daily-scriptures/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    dailyScripturesRaw.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religions = await prisma.religion.findMany();
    const themes = await prisma.theme.findMany();

    const dailyScripturesProcessed: ProcessedDailyScriptureData[] =
      dailyScripturesRaw.map((dailyScripture) => {
        const religion = religions.find(
          (religion) => religion.code === dailyScripture.religion,
        );
        const theme = themes.find(
          (theme) => theme.code === dailyScripture.theme,
        );

        return {
          dayId: dailyScripture.id,
          themeId: theme.id,
          religionId: religion.id,
          content: dailyScripture.content,
        };
      });

    await prisma.dailyScripture.createMany({
      data: dailyScripturesProcessed,
      skipDuplicates: true,
    });
  });
}

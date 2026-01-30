import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { SeedChristianReligion } from '../../../constants';
import { CreateMindfulnessResourceCategoryDto } from '../../../generated/create-mindfulnessResourceCategory.dto';

const prisma = new PrismaClient();

export default async function seedChristianMindfulnessResourceCategories() {
  // create an array to hold the parsed JSON objects
  const mindfulnessResourceCategories: CreateMindfulnessResourceCategoryDto[] =
    [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/mindfulness-resources-categories/christian/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    mindfulnessResourceCategories.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religion = await prisma.religion.findFirst({
      where: {
        code: SeedChristianReligion.code,
      },
    });
    await prisma.mindfulnessResourceCategory.createMany({
      data: mindfulnessResourceCategories.map(
        (mindfulnessResourceCategory) => ({
          ...mindfulnessResourceCategory,
          religionId: religion.id,
        }),
      ),
      skipDuplicates: true,
    });
  });
}

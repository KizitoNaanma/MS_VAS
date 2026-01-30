import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { SeedChristianReligion } from '../../../constants';

const prisma = new PrismaClient();

type RawMindfulnessResourceData = {
  name: string;
  category: string;
  textContent: string;
  audioObjectKey: string;
  imageObjectKey: string;
};

type ProcessedMindfulnessResourceData = Omit<
  RawMindfulnessResourceData,
  'category'
> & {
  categoryId: string;
};

export default async function seedChristianMindfulnessResources() {
  // create an array to hold the parsed JSON objects
  const mindfulnessResourcesRaw: RawMindfulnessResourceData[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/mindfulness-resources/christian/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    mindfulnessResourcesRaw.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religion = await prisma.religion.findFirst({
      where: {
        code: SeedChristianReligion.code,
      },
    });
    const categories = await prisma.mindfulnessResourceCategory.findMany({
      where: {
        religionId: religion.id,
      },
    });

    const mindfulnessResourcesProcessed: ProcessedMindfulnessResourceData[] =
      mindfulnessResourcesRaw.map((mindfulnessResource) => {
        const category = categories.find(
          (category) => category.code === mindfulnessResource.category,
        );

        return {
          name: mindfulnessResource.name,
          textContent: mindfulnessResource.textContent,
          audioObjectKey: mindfulnessResource.audioObjectKey,
          categoryId: category.id,
          imageObjectKey: mindfulnessResource.imageObjectKey,
        };
      });

    await prisma.mindfulnessResource.createMany({
      data: mindfulnessResourcesProcessed,
      skipDuplicates: true,
    });
  });
}

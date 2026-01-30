import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { CreateCourseCategoryDto } from '../../../generated/create-courseCategory.dto';
import { SeedChristianReligion } from '../../../constants';

const prisma = new PrismaClient();

export default async function seedChristianCourseCategories() {
  // create an array to hold the parsed JSON objects
  const courseCategories: CreateCourseCategoryDto[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/course-categories/christian/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    courseCategories.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religion = await prisma.religion.findFirst({
      where: {
        code: SeedChristianReligion.code,
      },
    });
    await prisma.courseCategory.createMany({
      data: courseCategories.map((courseCategory) => ({
        ...courseCategory,
        religionId: religion.id,
      })),
      skipDuplicates: true,
    });
  });
}

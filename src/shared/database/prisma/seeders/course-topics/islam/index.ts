import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { SeedIslamReligion } from '../../../constants';
import { CreateCourseTopicDto } from '../../../generated/create-courseTopic.dto';

const prisma = new PrismaClient();

type CourseTopic = CreateCourseTopicDto & {
  category_code: string;
};

export default async function seedIslamCourseTopics() {
  // create an array to hold the parsed JSON objects
  const courseTopics: CourseTopic[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/course-topics/islam/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    courseTopics.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religion = await prisma.religion.findFirst({
      where: {
        code: SeedIslamReligion.code,
      },
    });

    const courseTopicsWithCategory = await Promise.all(
      courseTopics.map(async (courseTopic) => {
        const courseCategory = await prisma.courseCategory.findFirst({
          where: {
            code: courseTopic.category_code,
          },
        });

        return {
          name: courseTopic.name,
          code: courseTopic.code,
          religionId: religion.id,
          courseCategoryId: courseCategory.id,
        };
      }),
    );

    await prisma.courseTopic.createMany({
      data: courseTopicsWithCategory,
      skipDuplicates: true,
    });
  });
}

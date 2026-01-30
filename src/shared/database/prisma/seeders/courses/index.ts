import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { CreateCourseLessonDto } from '../../generated/create-courseLesson.dto';

const prisma = new PrismaClient();

type CourseDatasetType = {
  id: string;
  religion: string;
  topic: string;
  title: string;
  category: string;
  description: string;
  lessons: {
    name: string;
    content: string;
  }[];
};

export default async function seedCourses() {
  // create an array to hold the parsed JSON objects
  const course_datasets: CourseDatasetType[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/courses/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    course_datasets.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    course_datasets.forEach(async (course_dataset) => {
      const category = await prisma.courseCategory.findFirst({
        where: {
          code: course_dataset.category,
        },
      });
      const courseTopic = await prisma.courseTopic.findFirst({
        where: {
          code: course_dataset.topic,
        },
      });
      const lessons: CreateCourseLessonDto[] = [];
      course_dataset.lessons.forEach((lesson, index) => {
        lessons.push({
          name: lesson.name,
          content: lesson.content,
          ordering: index + 1,
        });
      });

      await prisma.course.create({
        data: {
          name: course_dataset.title,
          description: course_dataset.description,
          categoryId: category.id,
          religionId: category.religionId,
          courseTopicId: courseTopic.id,
          lessons: {
            createMany: {
              data: lessons,
            },
          },
        },
      });
    });
  });
}

import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { CreateReligionDto } from '../../generated/create-religion.dto';

const prisma = new PrismaClient();

export default async function seedReligions() {
  // create an array to hold the parsed JSON objects
  const religions: CreateReligionDto[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/religions/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    religions.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    await prisma.religion.createMany({
      data: religions,
      skipDuplicates: true,
    });
  });
}

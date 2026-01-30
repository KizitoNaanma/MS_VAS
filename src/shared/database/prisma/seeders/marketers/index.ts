import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();

type MarketerData = {
  name: string;
  prefix: string;
  isActive: boolean;
  postbackUrl: string | null;
  payout: string;
};

export default async function seedMarketers() {
  // create an array to hold the parsed JSON objects
  const marketers: MarketerData[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/marketers/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    marketers.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    await prisma.marketer.createMany({
      data: marketers,
      skipDuplicates: true,
    });
  });
}

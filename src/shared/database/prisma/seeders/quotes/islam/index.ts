import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { SeedIslamReligion } from '../../../constants';
import { CreateQuoteDto } from '../../../generated/create-quote.dto';

const prisma = new PrismaClient();

export default async function seedIslamicQuotes() {
  // create an array to hold the parsed JSON objects
  const quotes: CreateQuoteDto[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/quotes/islam/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    quotes.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religion = await prisma.religion.findFirst({
      where: {
        code: SeedIslamReligion.code,
      },
    });
    await prisma.quote.createMany({
      data: quotes.map((quote) => ({
        content: quote.content,
        author: quote.author,
        religionId: religion.id,
      })),
      skipDuplicates: true,
    });
  });
}

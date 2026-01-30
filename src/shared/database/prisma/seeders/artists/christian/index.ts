import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();

type ArtistsDatasetType = {
  name: string;
  slug: string;
  religion: string;
  imageObjectKey: string;
};

export default async function seedChristianArtists() {
  // create an array to hold the parsed JSON objects
  const artists: ArtistsDatasetType[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/artists/christian/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    artists.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religions = await prisma.religion.findMany();
    const artistsProcessed = artists.map((artist) => {
      const religion = religions.find((r) => r.code === artist.religion);
      return {
        name: artist.name,
        slug: artist.slug,
        religionId: religion.id,
        imageObjectKey: artist.imageObjectKey,
      };
    });
    await prisma.artist.createMany({
      data: artistsProcessed,
      skipDuplicates: true,
    });
  });
}

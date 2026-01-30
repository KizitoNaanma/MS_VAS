import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();

type AlbumsDatasetType = {
  name: string;
  slug: string;
  religion: string;
  artists: string;
  artistsSlugs: string[];
  imageObjectKey: string;
};

export default async function seedAlbums() {
  const albums: AlbumsDatasetType[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/albums/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  reader.on('line', (line) => {
    const album = JSON.parse(line);
    albums.push({
      name: album.name,
      slug: album.slug,
      artists: album.artists,
      artistsSlugs: album.artists.split(','),
      religion: album.religion,
      imageObjectKey: album.imageObjectKey,
    });
  });

  reader.on('close', async () => {
    const religions = await prisma.religion.findMany();
    const artists = await prisma.artist.findMany();

    for (const album of albums) {
      const religion = religions.find((r) => r.code === album.religion);

      // Find all artists that should be connected to this album
      const albumArtists = artists.filter((a) => {
        // For regular albums, connect the specified artist
        return album.artistsSlugs.includes(a.slug);
      });

      // Create the album with connected artists
      await prisma.album.create({
        data: {
          name: album.name,
          imageObjectKey: album.imageObjectKey,
          slug: album.slug,
          religionId: religion.id,
          artists: {
            connect: albumArtists.map((artist) => ({ id: artist.id })),
          },
        },
      });
    }
  });
}

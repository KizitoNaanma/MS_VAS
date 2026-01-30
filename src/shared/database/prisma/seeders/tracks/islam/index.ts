import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();

interface TracksDatasetType {
  name: string;
  artist: string;
  album: string;
  religion: string;
  duration: string;
  audioObjectKey: string;
  imageObjectKey: string;
  isSingle: string;
}

export default async function seedIslamicTracks() {
  // create an array to hold the parsed JSON objects
  const tracks: TracksDatasetType[] = [];

  const reader = createInterface({
    input: fs.createReadStream(
      'src/shared/database/prisma/seedlings/tracks/islam/index.jsonl',
    ),
    crlfDelay: Infinity,
  });

  // read each line of the file and parse it as JSON
  reader.on('line', (line) => {
    tracks.push(JSON.parse(line));
  });

  reader.on('close', async () => {
    const religions = await prisma.religion.findMany();
    const artists = await prisma.artist.findMany();
    const albums = await prisma.album.findMany();
    const tracksProcessed = tracks.map((track) => {
      const religion = religions.find((r) => r.code === track.religion);
      const artist = artists.find((a) => a.slug === track.artist);
      const album = albums.find((a) => a.slug === track.album);
      return {
        name: track.name,
        artistId: artist?.id,
        albumId: album?.id,
        duration: Number(track.duration),
        audioObjectKey: track.audioObjectKey,
        imageObjectKey: track.imageObjectKey,
        religionId: religion?.id,
        isSingle: track.isSingle === 'true',
      };
    });
    await prisma.track.createMany({
      data: tracksProcessed,
      skipDuplicates: true,
    });
  });
}

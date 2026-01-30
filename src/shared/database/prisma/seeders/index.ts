import { parseArgs } from 'node:util';
import seedDailyPrayers from './daily-prayers';
import seedReligions from './religions';

import { PrismaClient } from '@prisma/client';
import seedChristianThemes from './themes/christian';
import seedIslamThemes from './themes/islam';
import seedDailyScriptures from './daily-scriptures';
import seedDailyDevotionals from './daily-devotionals';
import seedChristianCourseCategories from './course-categories/christian';
import seedIslamicCourseCategories from './course-categories/islam';
import seedChristianCourseTopics from './course-topics/christian';
import seedIslamCourseTopics from './course-topics/islam';
import seedCourses from './courses';
import seedChristianMindfulnessResourceCategories from './mindfulness-resources-categories/christian';
import seedIslamicMindfulnessResourceCategories from './mindfulness-resources-categories/islam';
import seedChristianMindfulnessResources from './mindfulness-resources/christian';
import seedIslamicMindfulnessResources from './mindfulness-resources/islam';
import seedChristianArtists from './artists/christian';
import seedIslamicArtists from './artists/islam';
import seedAlbums from './albums';
import seedChristianTracks from './tracks/christian';
import seedIslamicTracks from './tracks/islam';
import seedChristianQuotes from './quotes/christian';
import seedIslamicQuotes from './quotes/islam';
import seedDailyQuizzes from './daily-quizzes';
import seedMarketers from './marketers';

const prisma = new PrismaClient();

const options = {
  type: { type: 'string' as const },
};

async function main() {
  const {
    values: { type },
  } = parseArgs({ options });

  if (type === 'religions') {
    await seedReligions();
  } else if (type === 'themes') {
    await seedChristianThemes();
    await seedIslamThemes();
  } else if (type === 'daily-prayers') {
    await seedDailyPrayers();
  } else if (type === 'daily-scriptures') {
    await seedDailyScriptures();
  } else if (type === 'daily-devotionals') {
    await seedDailyDevotionals();
  } else if (type === 'course-categories') {
    await seedChristianCourseCategories();
    await seedIslamicCourseCategories();
  } else if (type === 'course-topics') {
    await seedChristianCourseTopics();
    await seedIslamCourseTopics();
  } else if (type === 'courses') {
    await seedCourses();
  } else if (type === 'mindfulness-resources-categories') {
    await seedChristianMindfulnessResourceCategories();
    await seedIslamicMindfulnessResourceCategories();
  } else if (type === 'mindfulness-resources') {
    await seedChristianMindfulnessResources();
    await seedIslamicMindfulnessResources();
  } else if (type === 'artists') {
    await seedChristianArtists();
    await seedIslamicArtists();
  } else if (type === 'albums') {
    await seedAlbums();
  } else if (type === 'tracks') {
    await seedChristianTracks();
    await seedIslamicTracks();
  } else if (type === 'quotes') {
    await seedChristianQuotes();
    await seedIslamicQuotes();
  } else if (type === 'daily-quizzes') {
    await seedDailyQuizzes();
  } else if (type === 'marketers') {
    await seedMarketers();
  } else {
    console.log('Invalid type');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

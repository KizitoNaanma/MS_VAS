-- RenameColumn
ALTER TABLE
  "Album" RENAME COLUMN "imageUrl" TO "imageObjectKey";

-- RenameColumn
ALTER TABLE
  "Artist" RENAME COLUMN "imageUrl" TO "imageObjectKey";

-- RenameColumn
ALTER TABLE
  "Course" RENAME COLUMN "imageUrl" TO "imageObjectKey";

-- RenameColumn
ALTER TABLE
  "Course" RENAME COLUMN "videoUrl" TO "videoObjectKey";

-- RenameColumn
ALTER TABLE
  "MindfulnessResource" RENAME COLUMN "audioUrl" TO "audioObjectKey";

-- RenameColumn
ALTER TABLE
  "Track" RENAME COLUMN "audioUrl" TO "audioObjectKey";

-- RenameColumn
ALTER TABLE
  "Track" RENAME COLUMN "imageUrl" TO "imageObjectKey";

-- RenameColumn
ALTER TABLE
  "Attachment" RENAME COLUMN "url" TO "objectKey";
-- CreateTable
CREATE TABLE "DailyDevotional" (
    "id" TEXT NOT NULL,
    "dayId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "religionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyDevotional_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyDevotional" ADD CONSTRAINT "DailyDevotional_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyDevotional" ADD CONSTRAINT "DailyDevotional_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

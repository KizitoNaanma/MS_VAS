-- CreateTable
CREATE TABLE "DailyScripture" (
    "id" TEXT NOT NULL,
    "dayId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "religionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyScripture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyScripture" ADD CONSTRAINT "DailyScripture_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyScripture" ADD CONSTRAINT "DailyScripture_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

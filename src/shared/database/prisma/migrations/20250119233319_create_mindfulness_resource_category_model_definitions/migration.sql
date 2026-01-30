-- CreateTable
CREATE TABLE "MindfulnessResourceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "religionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MindfulnessResourceCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MindfulnessResourceCategory" ADD CONSTRAINT "MindfulnessResourceCategory_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

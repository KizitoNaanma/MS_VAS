-- CreateTable
CREATE TABLE "MindfulnessResource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "textContent" TEXT,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MindfulnessResource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MindfulnessResource" ADD CONSTRAINT "MindfulnessResource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MindfulnessResourceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

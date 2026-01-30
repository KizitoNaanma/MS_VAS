-- DropForeignKey
ALTER TABLE "QuizUserAnswer" DROP CONSTRAINT "QuizUserAnswer_attemptId_fkey";

-- AddForeignKey
ALTER TABLE "QuizUserAnswer" ADD CONSTRAINT "QuizUserAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

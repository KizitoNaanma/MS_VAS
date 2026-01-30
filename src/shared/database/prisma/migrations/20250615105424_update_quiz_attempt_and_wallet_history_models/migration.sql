-- AlterTable
ALTER TABLE "WalletHistory" ADD COLUMN     "quizAttemptId" TEXT;

-- CreateIndex
CREATE INDEX "WalletHistory_quizAttemptId_idx" ON "WalletHistory"("quizAttemptId");

-- AddForeignKey
ALTER TABLE "WalletHistory" ADD CONSTRAINT "WalletHistory_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "QuizAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

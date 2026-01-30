import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();

interface QuizQuestionData {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
}

interface DailyQuizData {
  id: number;
  religion: string;
  theme: string;
  quiz: QuizQuestionData[];
}

/**
 * Seeds daily quiz data from JSONL file into the database
 * Each line in the JSONL file contains a quiz for a specific day with questions and answers
 */
export default async function seedDailyQuizzes() {
  // Collection to store parsed quiz data from JSONL file
  const quizDataEntries: DailyQuizData[] = [];

  // Path to the JSONL file containing quiz data
  const quizDataFilePath =
    'src/shared/database/prisma/seedlings/daily-quizzes/index.jsonl';

  // Create a line reader for processing the JSONL file
  const lineReader = createInterface({
    input: fs.createReadStream(quizDataFilePath),
    crlfDelay: Infinity, // Recognize all instances of CR LF as a single newline
  });

  // Process each line of the JSONL file as a separate quiz entry
  lineReader.on('line', (line) => {
    quizDataEntries.push(JSON.parse(line));
  });

  // Process all quiz data once file reading is complete
  lineReader.on('close', async () => {
    // Fetch existing religions and themes to associate with quizzes
    const religions = await prisma.religion.findMany();
    const themes = await prisma.theme.findMany();

    // Process each quiz entry
    for (const quizEntry of quizDataEntries) {
      // Find matching religion and theme from database
      const matchingReligion = religions.find(
        (religion) => religion.code === quizEntry.religion,
      );
      const matchingTheme = themes.find(
        (theme) => theme.code === quizEntry.theme,
      );

      // Generate quiz set metadata
      const dayNumber = quizEntry.id;
      const quizTitle = `Day ${dayNumber} Quiz: ${matchingTheme.name}`;
      const quizDescription = `Quiz for day ${dayNumber}`;

      // Quiz parameters (could be configurable in the future)
      const quizTimeLimit = 60; // seconds
      const quizPassingScore = 100;

      // Create the quiz set in database
      const createdQuizSet = await prisma.quizSet.create({
        data: {
          dayId: dayNumber,
          title: quizTitle,
          description: quizDescription,
          timeLimit: quizTimeLimit,
          passingScore: quizPassingScore,
          themeId: matchingTheme.id,
          religionId: matchingReligion.id,
        },
      });

      // Extract questions from the current quiz entry
      const questions = quizEntry.quiz;

      // Process each question in the quiz
      for (const [questionIndex, questionData] of questions.entries()) {
        const correctOptionKey = questionData.correct_answer;

        // Create question in database
        const createdQuestion = await prisma.quizQuestion.create({
          data: {
            quizSetId: createdQuizSet.id,
            content: questionData.question,
            ordering: questionIndex + 1,
          },
        });

        // Process all answer options for this question
        const optionKeys = Object.keys(questionData.options);
        const optionValues = Object.values(questionData.options);
        let correctAnswerId: string | null = null;

        // Create each answer option in database
        for (let i = 0; i < optionKeys.length; i++) {
          const optionKey = optionKeys[i];
          const isCorrectOption = optionKey === correctOptionKey;

          // Create answer option
          const createdOption = await prisma.quizAnswerOption.create({
            data: {
              questionId: createdQuestion.id,
              content: optionValues[i], // Use i instead of questionIndex to get correct option
              isCorrect: isCorrectOption,
              explanation: isCorrectOption
                ? 'This is the correct answer.'
                : null,
            },
          });

          // Track the correct answer ID for updating the question later
          if (isCorrectOption) {
            correctAnswerId = createdOption.id;
          }
        }

        // Update question with correct answer reference
        if (correctAnswerId) {
          await prisma.quizQuestion.update({
            where: { id: createdQuestion.id },
            data: { correctAnswerId },
          });
        }
      }
    }

    console.log('Daily quiz seeding completed successfully.');
  });
}

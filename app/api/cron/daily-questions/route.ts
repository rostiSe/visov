// File: /app/api/cron/daily-questions/route.ts
// Vercel (Next.js App Router) API Route for daily questions cron

import { prisma } from '@/lib/prisma-client';
import { NextResponse } from 'next/server';

// --- CONFIGURATION ---
const GLOBAL_QUESTIONS_PACKAGE_ID = process.env.GLOBAL_QUESTIONS_PACKAGE_ID;
if (!GLOBAL_QUESTIONS_PACKAGE_ID) {
  throw new Error('Missing GLOBAL_QUESTIONS_PACKAGE_ID environment variable');
}

// Utility to get today's date at UTC midnight
function getToday(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Helper function to handle the daily questions logic
async function handleDailyQuestions() {
  const today = getToday();
  console.log(`Running daily questions for ${today.toISOString()}`);

  try {
    // --- Part 1: Global Question ---
    console.log('Processing global questions...');
    const globalQuestions = await prisma.question.findMany({
      where: { packageId: GLOBAL_QUESTIONS_PACKAGE_ID, isActive: true },
      select: { id: true },
    });
    
    if (globalQuestions.length === 0) {
      throw new Error('No active global questions found');
    }

    const randomGlobal = globalQuestions[Math.floor(Math.random() * globalQuestions.length)];
    console.log(`Selected global question: ${randomGlobal.id}`);

    const allGroups = await prisma.group.findMany({ select: { id: true } });
    console.log(`Found ${allGroups.length} groups to process`);

    const globalResult = await prisma.answer.createMany({
      data: allGroups.map(g => ({
        groupId: g.id,
        questionId: randomGlobal.id,
        date: today,
        type: 'GLOBAL',
      })),
      skipDuplicates: true,
    });
    console.log(`Created ${globalResult.count} global question entries`);

    // --- Part 2: Package Questions ---
    console.log('Processing package questions...');
    
    // Get all groups with their subscribed packages and questions
    const groupsWithPackages = await prisma.group.findMany({
      where: { 
        subscribedPackages: { 
          some: { 
            isActive: true,
            questions: {
              some: { isActive: true }
            }
          } 
        } 
      },
      select: {
        id: true,
        subscribedPackages: {
          where: { 
            isActive: true,
            questions: {
              some: { isActive: true }
            }
          },
          select: {
            id: true,
            questions: { 
              where: { isActive: true }, 
              select: { id: true } 
            }
          }
        },
        answers: { 
          where: { 
            date: today, 
            type: 'PACKAGE' 
          }, 
          select: { 
            questionId: true,
            question: {
              select: {
                packageId: true
              }
            }
          } 
        }
      },
    });

    console.log(`Found ${groupsWithPackages.length} groups with subscribed packages`);

    const packageEntries: Array<{ 
      groupId: string; 
      questionId: string; 
      date: Date; 
      type: 'PACKAGE' 
    }> = [];

    // Track created questions per group and package
    const createdQuestions = new Map<string, Set<string>>();

    for (const group of groupsWithPackages) {
      // Initialize group in the map if not exists
      if (!createdQuestions.has(group.id)) {
        createdQuestions.set(group.id, new Set());
      }
      const groupCreatedQuestions = createdQuestions.get(group.id)!;

      // Process each subscribed package
      for (const pkg of group.subscribedPackages) {
        // Skip if no questions in package
        if (pkg.questions.length === 0) continue;

        // Get already asked questions for this group and package today
        const askedQuestionIds = new Set(
          group.answers
            .filter(a => a.question?.packageId === pkg.id)
            .map(a => a.questionId)
        );

        // Get available questions (not asked yet)
        let availableQuestions = pkg.questions
          .filter(q => !askedQuestionIds.has(q.id))
          .map(q => q.id);

        // If no available questions, reset and use all questions
        if (availableQuestions.length === 0 && pkg.questions.length > 0) {
          availableQuestions = pkg.questions.map(q => q.id);
        }

        // Skip if still no questions available
        if (availableQuestions.length === 0) continue;

        // Pick a random question
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const questionId = availableQuestions[randomIndex];
        
        // Add to entries if not already added for this group
        if (!groupCreatedQuestions.has(questionId)) {
          packageEntries.push({
            groupId: group.id,
            questionId,
            date: today,
            type: 'PACKAGE'
          });
          groupCreatedQuestions.add(questionId);
        }
      }
    }

    let packageResult = { count: 0 };
    if (packageEntries.length > 0) {
      packageResult = await prisma.answer.createMany({ 
        data: packageEntries, 
        skipDuplicates: true 
      });
    }
    console.log(`Created ${packageResult.count} package question entries`);

    return {
      success: true,
      globalQuestionsCreated: globalResult.count,
      packageQuestionsCreated: packageResult.count,
      totalGroups: allGroups.length,
      groupsWithPackages: groupsWithPackages.length,
      packagesProcessed: new Set(groupsWithPackages.flatMap(g => 
        g.subscribedPackages.map(p => p.id)
      )).size,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in handleDailyQuestions:', error);
    throw error;
  }
}

// Handle GET requests (for manual triggering and testing)
export async function GET() {
  try {
    console.log('GET request received for daily questions');
    const result = await handleDailyQuestions();
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/cron/daily-questions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests from Vercel Cron
 */
export async function POST() {
  try {
    const result = await handleDailyQuestions();
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/cron/daily-questions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
    
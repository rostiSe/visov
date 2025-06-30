// File: /app/api/cron/daily-questions/route.ts
// Vercel (Next.js App Router) API Route for daily questions cron
// Must export named HTTP method handlers—no default export.

import { prisma } from '@/lib/prisma-client';

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

/**
 * Handle POST requests from Vercel Cron
 */
export async function POST(request: Request) {
  try {
    const today = getToday();

    // --- Part 1: Global Question ---
    const globalQuestions = await prisma.question.findMany({
      where: { packageId: GLOBAL_QUESTIONS_PACKAGE_ID, isActive: true },
      select: { id: true },
    });
    if (globalQuestions.length === 0) {
      return new Response(JSON.stringify({ error: 'No active global questions found' }), { status: 500 });
    }
    const randomGlobal = globalQuestions[Math.floor(Math.random() * globalQuestions.length)];

    const allGroups = await prisma.group.findMany({ select: { id: true } });
    await prisma.answer.createMany({
      data: allGroups.map(g => ({
        groupId: g.id,
        questionId: randomGlobal.id,
        date: today,
        type: 'GLOBAL',
      })),
      skipDuplicates: true,
    });

    // --- Part 2: Package Questions ---
    const subscribedGroups = await prisma.group.findMany({
      where: { subscribedPackages: { some: { isActive: true } } },
      select: {
        id: true,
        subscribedPackages: {
          where: { isActive: true },
          select: {
            questions: { where: { isActive: true }, select: { id: true } }
          }
        },
        answers: { where: { date: today, type: 'PACKAGE' }, select: { questionId: true } }
      },
    });

    const packageEntries: Array<{ groupId: string; questionId: string; date: Date; type: 'PACKAGE' }> = [];

    for (const group of subscribedGroups) {
      // Flatten all active questions from subscribed packages
      const allQs = group.subscribedPackages.flatMap(pkg => pkg.questions.map(q => q.id));
      const askedIds = new Set(group.answers.map(a => a.questionId));

      // Determine pool of available questions
      let pool = allQs.filter(id => !askedIds.has(id));
      if (pool.length === 0 && allQs.length > 0) {
        pool = allQs; // reset when exhausted
      }
      if (pool.length === 0) continue;

      // Pick a random question and queue it
      const questionId = pool[Math.floor(Math.random() * pool.length)];
      packageEntries.push({ groupId: group.id, questionId, date: today, type: 'PACKAGE' });
    }

    if (packageEntries.length > 0) {
      await prisma.answer.createMany({ data: packageEntries, skipDuplicates: true });
    }

    return new Response(JSON.stringify({ message: 'Daily questions created.' }), { status: 200 });
  } catch (error) {
    console.error('Cron daily-questions error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma-client';

function getTodayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string; questionId: string } }
) {
  const { groupId, questionId } = params;
  const today = getTodayUTC();

  try {
    // Authenticate user
    const headers = new Headers();
    request.headers.forEach((value, key) => headers.set(key, value));
    const session = await auth.api.getSession({ headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find voter profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get the answer record for today's question
    const answer = await prisma.answer.findFirst({
      where: {
        groupId,
        questionId,
        date: today
      }
    });

    if (!answer) {
      return NextResponse.json({ 
        hasAnswered: false,
        results: [],
        userChoice: null
      });
    }

    // Get all group members
    const members = await prisma.profile.findMany({
      where: {
        groups: {
          some: { id: groupId }
        }
      },
      select: {
        id: true,
        username: true,
        profilePicture: true
      }
    });

    // Process votes
    const votes = (answer.votes as Record<string, string>) || {};
    const tally: Record<string, number> = {};
    
    // Count votes for each member
    Object.values(votes).forEach((votedForId) => {
      tally[votedForId] = (tally[votedForId] || 0) + 1;
    });

    // Format results
    const results = members.map((member) => ({
      member,
      count: tally[member.id] || 0
    }));

    const userChoice = votes[profile.id] || null;
    const hasAnswered = profile.id in votes;

    return NextResponse.json({
      hasAnswered,
      userChoice,
      results
    });

  } catch (error) {
    console.error('Error fetching answer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch answer' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string; questionId: string } }
) {
  const { groupId, questionId } = params;
  const today = getTodayUTC();

  try {
    // Authenticate user
    const headers = new Headers();
    request.headers.forEach((value, key) => headers.set(key, value));
    const session = await auth.api.getSession({ headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { chosenUserId } = await request.json();
    
    if (!chosenUserId) {
      return NextResponse.json(
        { error: 'Missing chosenUserId' },
        { status: 400 }
      );
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Verify the chosen user is in the group
    const chosenUser = await prisma.profile.findFirst({
      where: {
        id: chosenUserId,
        groups: {
          some: { id: groupId }
        }
      },
      select: { id: true }
    });

    if (!chosenUser) {
      return NextResponse.json(
        { error: 'Chosen user not found in group' },
        { status: 400 }
      );
    }

    // Get existing answer if it exists
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        groupId,
        questionId,
        date: today
      },
      select: { id: true, votes: true }
    });

    let answer;
    if (existingAnswer) {
      // Update existing answer
      answer = await prisma.answer.update({
        where: { id: existingAnswer.id },
        data: {
          votes: {
            ...(existingAnswer.votes as Record<string, string> || {}),
            [profile.id]: chosenUserId
          }
        },
        include: {
          question: {
            select: { packageId: true }
          }
        }
      });
    } else {
      // Create new answer
      answer = await prisma.answer.create({
        data: {
          groupId,
          questionId,
          date: today,
          votes: { [profile.id]: chosenUserId },
          type: 'PACKAGE' // Will be updated by cron job if needed
        },
        include: {
          question: {
            select: { packageId: true }
          }
        }
      });
    }

    // Update answer type if needed (for backward compatibility)
    if (!answer.type) {
      const answerType = answer.question?.packageId ? 'PACKAGE' : 'GLOBAL';
      await prisma.answer.update({
        where: { id: answer.id },
        data: { type: answerType }
      });
    }

    // Get updated results
    const votes = (answer.votes as Record<string, string>) || {};
    const tally: Record<string, number> = {};
    
    Object.values(votes).forEach((votedForId) => {
      tally[votedForId] = (tally[votedForId] || 0) + 1;
    });

    const members = await prisma.profile.findMany({
      where: {
        groups: {
          some: { id: groupId }
        }
      },
      select: {
        id: true,
        username: true,
        profilePicture: true
      }
    });

    const results = members.map((member) => ({
      member,
      count: tally[member.id] || 0
    }));

    return NextResponse.json({
      hasAnswered: true,
      userChoice: chosenUserId,
      results
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

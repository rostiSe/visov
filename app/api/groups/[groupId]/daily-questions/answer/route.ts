// File: /app/api/groups/[groupId]/daily-question/answer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma-client';

// Utility to get today's date key (UTC midnight)
function getTodayDate(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Handle GET: check if user answered and return results
export async function GET(request: NextRequest, context: { params: { groupId: string } }) {
  const { groupId } = context.params;
  try {
    // Authenticate user
    const headers = new Headers();
    request.headers.forEach((v, k) => headers.set(k, v));
    const session = await auth.api.getSession({ headers: headers as unknown as Headers });
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

    const todayDate = getTodayDate();

    // Fetch the Answer record
    const answerRecord = await prisma.answer.findUnique({
      where: { groupId_date: { groupId, date: todayDate } }
    });
    if (!answerRecord) {
      return NextResponse.json({ hasAnswered: false, results: [], userChoice: null });
    }

    // Extract votes
    const votesMap = (answerRecord.votes as Record<string, string>) || {};
    const hasAnswered = profile.id in votesMap;

    // Tally votes
    const tally: Record<string, number> = {};
    Object.values(votesMap).forEach((id) => {
      tally[id] = (tally[id] || 0) + 1;
    });

    // Fetch voted members
    const votedUserIds = Object.keys(tally);
    const votedMembers = votedUserIds.length > 0
      ? await prisma.profile.findMany({ where: { id: { in: votedUserIds } }, select: { id: true, username: true, profilePicture: true } })
      : [];

    const results = votedMembers.map((m) => ({ member: m, count: tally[m.id] || 0 }));
    const userChoice = hasAnswered ? votesMap[profile.id] : null;

    return NextResponse.json({ hasAnswered, userChoice, results });
  } catch (err) {
    console.error('Error fetching vote status:', err);
    return NextResponse.json({ error: 'Failed to fetch vote status' }, { status: 500 });
  }
}

// Handle POST: submit or update vote
export async function POST(request: NextRequest, context: { params: { groupId: string } }) {
  const { groupId } = context.params;
  try {
    // Authenticate user
    const headers = new Headers();
    request.headers.forEach((v, k) => headers.set(k, v));
    const session = await auth.api.getSession({ headers: headers as unknown as Headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse payload
    const { chosenUserId } = await request.json();
    if (!chosenUserId) {
      return NextResponse.json({ error: 'Missing chosenUserId' }, { status: 400 });
    }

    // Find voter profile
    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Validate chosen user
    const member = await prisma.profile.findFirst({ where: { id: chosenUserId, groups: { some: { id: groupId } } }, select: { id: true } });
    if (!member) {
      return NextResponse.json({ error: 'Chosen user not in group' }, { status: 400 });
    }

    const todayDate = getTodayDate();

    // Fetch or create answer record
    let answerRecord = await prisma.answer.findUnique({ where: { groupId_date: { groupId, date: todayDate } } });
    if (!answerRecord) {
      return NextResponse.json({ error: 'Daily question not found for today' }, { status: 404 });
    }

    // Update votes
    const existingVotes = (answerRecord.votes as Record<string, string>) || {};
    const updatedVotes = { ...existingVotes, [profile.id]: chosenUserId };
    const updated = await prisma.answer.update({ where: { id: answerRecord.id }, data: { votes: updatedVotes } });

    // Return updated status
    return NextResponse.json({ hasAnswered: true, userChoice: chosenUserId, results: [] });

  } catch (err) {
    console.error('Error submitting vote:', err);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}

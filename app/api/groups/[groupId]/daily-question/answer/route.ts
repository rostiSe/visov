import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma-client';

interface RouteParams {
  params: {
    groupId: string;
  };
}

export async function POST(
  request: Request,
  context: { params: { groupId: string } }
): Promise<NextResponse> {
  const { params } = context;
  try {
    // Get the current user session
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    const session = await auth.api.getSession({
      headers: headers as unknown as Headers
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const groupId = params.groupId;
    const { dailyQuestionId, chosenUserId } = await request.json();

    if (!dailyQuestionId || !chosenUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Verify the daily question exists and is active
    const dailyQuestion = await prisma.dailyQuestion.findUnique({
      where: { 
        id: dailyQuestionId,
        groupId,
        isActive: true
      },
      select: { id: true }
    });

    if (!dailyQuestion) {
      return NextResponse.json(
        { error: 'Question not found or inactive' },
        { status: 404 }
      );
    }

    // Check if the chosen user is in the same group
    const chosenUserInGroup = await prisma.profile.findFirst({
      where: {
        id: chosenUserId,
        groups: {
          some: {
            id: groupId
          }
        }
      },
      select: { id: true }
    });

    if (!chosenUserInGroup) {
      return NextResponse.json(
        { error: 'Chosen user not found in group' },
        { status: 400 }
      );
    }

    // Check if user has already answered this question
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        dailyQuestionId,
        voterId: profile.id
      },
      select: { id: true }
    });

    let answer;

    if (existingAnswer) {
      // Update existing answer
      answer = await prisma.answer.update({
        where: { id: existingAnswer.id },
        data: {
          chosenUserId,
          answeredAt: new Date()
        },
        include: {
          chosenUser: {
            select: {
              id: true,
              username: true,
              profilePicture: true
            }
          }
        }
      });
    } else {
      // Create new answer
      answer = await prisma.answer.create({
        data: {
          question: {
            connect: { id: dailyQuestionId }
          },
          voter: {
            connect: { id: profile.id }
          },
          chosenUser: {
            connect: { id: chosenUserId }
          },
          group: {
            connect: { id: groupId }
          },
          dailyQuestion: {
            connect: { id: dailyQuestionId }
          },
          answeredAt: new Date()
        },
        include: {
          chosenUser: {
            select: {
              id: true,
              username: true,
              profilePicture: true
            }
          }
        }
      });
    }

    return NextResponse.json(answer);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

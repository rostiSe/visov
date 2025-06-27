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
  { params }: { params: { groupId: string } }
): Promise<NextResponse> {
  const { groupId } = params;
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

    // Check if the daily question exists, is active, and get its questionId
    const dailyQuestion = await prisma.dailyQuestion.findUnique({
      where: { 
        id: dailyQuestionId,
        groupId,
        isActive: true
      },
      select: { 
        id: true,
        questionId: true
      }
    });

    if (!dailyQuestion) {
      return NextResponse.json(
        { error: 'Question not found or inactive' },
        { status: 404 }
      );
    }

    // Verify the question exists
    const question = await prisma.question.findUnique({
      where: { id: dailyQuestion.questionId }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Associated question not found' },
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
        questionId: dailyQuestion.questionId,
        voterId: profile.id,
        groupId
      },
      select: { id: true }
    });

    try {
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
              connect: { id: dailyQuestion.questionId }
            },
            dailyQuestion: {
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
      console.error('Error submitting answer:');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'UnknownError',
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { 
          error: 'Failed to submit answer',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'UnknownError',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { 
        error: 'Failed to submit answer',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

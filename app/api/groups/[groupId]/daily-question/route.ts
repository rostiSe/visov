import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { auth } from '@/lib/auth';


export async function GET(
  request: NextRequest,
  context: any
) {
  const { params } = context;
  let session;
  try {
    // Get the current user session
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    session = await auth.api.getSession({
      headers: headers as unknown as Headers
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId } = params;
    
    // Get today's date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at 00:00:00
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get the user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get today's active question for the group
    const dailyQuestion = await prisma.dailyQuestion.findFirst({
      where: {
        groupId,
        date: {
          gte: today,
          lt: tomorrow
        },
        isActive: true
      },
      include: {
        question: {
          include: {
            package: {
              select: {
                name: true
              }
            }
          }
        },
        answers: {
          where: {
            voterId: profile.id
          },
          select: {
            id: true
          }
        }
      }
    });

    if (!dailyQuestion) {
      return NextResponse.json(null);
    }

    // Check if the current user has already answered
    const hasAnswered = dailyQuestion.answers.length > 0;

    return NextResponse.json({
      ...dailyQuestion,
      hasAnswered
    });
  } catch (error) {
    console.error('Error fetching daily question:');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails: Record<string, any> = {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'UnknownError',
      timestamp: new Date().toISOString(),
      groupId: params.groupId,
    };
    
    // Only include userId if we have a session
    if (session?.user?.id) {
      errorDetails.userId = session.user.id;
    }
    
    console.error('Error details:', errorDetails);
    return NextResponse.json(
      { 
        error: 'Failed to fetch daily question',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

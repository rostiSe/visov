import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { auth } from '@/lib/auth';

// Each question is valid for 24 hours from creation

export async function GET(
  request: NextRequest,
  context: any
) {
  const { params } = await context;
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

    const { groupId } = await params;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    
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

    // Get the most recent question for the group that's either active or scheduled for today
    const dailyQuestion = await prisma.dailyQuestion.findFirst({
      where: {
        groupId,
        OR: [
          {
            isActive: true,
            date: {
              // Question is valid for 24 hours from creation
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
            }
          },
          {
            // Also include questions scheduled for today, even if they're not active yet
            date: {
              gte: today, // Start of today
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Start of tomorrow
            }
          }
        ]
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
      },
      orderBy: {
        date: 'desc' // Get the most recent question
      }
    });

    console.log('Found daily question:', dailyQuestion ? 'Yes' : 'No');

    if (!dailyQuestion) {
      // Check if there are any questions at all for this group
      const anyQuestion = await prisma.dailyQuestion.findFirst({
        where: { groupId },
        orderBy: { date: 'desc' },
        take: 1
      });

      console.log('Any question exists for this group:', anyQuestion ? 'Yes' : 'No');
      
      if (anyQuestion) {
        console.log('Most recent question date:', anyQuestion.date);
      }

      // Calculate expiry time (24 hours after the most recent question or current time if no questions exist)
      const expiryTime = anyQuestion 
        ? new Date(anyQuestion.date.getTime() + 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 24 * 60 * 60 * 1000);

      return NextResponse.json(
        { 
          error: 'No active question found for today',
          details: {
            currentTime: now.toISOString(),
            today: today.toISOString(),
            expiryTime: expiryTime.toISOString(),
            hasAnyQuestions: !!anyQuestion,
            mostRecentQuestionDate: anyQuestion?.date?.toISOString()
          }
        },
        { status: 404 }
      );
    }

    // Check if the current user has already answered
    const hasAnswered = dailyQuestion.answers.length > 0;

    // Calculate time remaining in hours and minutes
    const expiryTime = new Date(dailyQuestion.date.getTime() + 24 * 60 * 60 * 1000);
    const timeRemainingMs = expiryTime.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemainingMs / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      ...dailyQuestion,
      hasAnswered,
      expiresIn: {
        hours: hoursRemaining,
        minutes: minutesRemaining
      }
    });
  } catch (error) {
    console.error('Error fetching daily question:');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails: Record<string, any> = {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'UnknownError',
      timestamp: new Date().toISOString(),
      groupId: (await params).groupId,
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

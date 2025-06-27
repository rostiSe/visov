import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { addDays, setHours } from 'date-fns';

// Helper function to get next weekday at 14:00 German time
function getNextQuestionDate(startDate: Date, dayOffset: number): Date {
  // Set to 14:00 German time
  let date = setHours(addDays(startDate, dayOffset), 14);
  
  // If it's a weekend, move to Monday
  if (date.getDay() === 0) { // Sunday
    date = addDays(date, 1);
  } else if (date.getDay() === 6) { // Saturday
    date = addDays(date, 2);
  }
  
  return date;
}

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;

    // Get the active package for the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        activePackage: {
          include: {
            questions: {
              where: { isActive: true },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Get all active packages except the currently active one
    const availablePackages = await prisma.package.findMany({
      where: {
        isActive: true,
        id: group.activePackageId ? { not: group.activePackageId } : undefined
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      activePackage: group.activePackage,
      availablePackages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Verify the package exists
    const packageExists = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!packageExists) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the group's active package
      const updatedGroup = await tx.group.update({
        where: { id: groupId },
        data: {
          activePackageId: packageId
        },
        include: {
          activePackage: {
            include: {
              questions: {
                where: { isActive: true },
                orderBy: { createdAt: 'asc' }
              }
            }
          }
        }
      });

      if (!updatedGroup.activePackage) {
        throw new Error('Failed to set active package');
      }

      // 2. Clear any existing scheduled questions for this group
      await tx.dailyQuestion.deleteMany({
        where: {
          groupId,
          date: {
            gte: new Date() // Only delete future questions
          }
        }
      });

      // 3. Schedule all questions from the package
      const questions = updatedGroup.activePackage.questions;
      const now = new Date();
      
      // Schedule each question for the next available weekday at 14:00
      const scheduledQuestions = await Promise.all(
        questions.map((question, index) => {
          const scheduledDate = getNextQuestionDate(now, index);
          
          return tx.dailyQuestion.create({
            data: {
              question: {
                connect: { id: question.id }
              },
              group: {
                connect: { id: groupId }
              },
              date: scheduledDate,
              isActive: index === 0 // Only activate the first question
            }
          });
        })
      );

      return {
        group: updatedGroup,
        scheduledCount: scheduledQuestions.length
      };
    });

    return NextResponse.json({
      success: true,
      scheduledCount: result.scheduledCount,
      group: result.group
    });
  } catch (error) {
    console.error('Error updating active package:', error);
    return NextResponse.json(
      { 
        error: 'Failed to activate package', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// app/api/packages/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { NextResponse } from "next/server";

interface Question {
  text: string;
}

interface RequestBody {
  title: string;  // This will be used as the package name
  description: string;
  questions: Question[];
  groupId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, questions, groupId }: RequestBody = await request.json();

    if (!title || !questions?.length || !groupId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the package with questions
    const newPackage = await prisma.$transaction(async (prisma) => {
      // First create the package with questions
      const createdPackage = await prisma.package.create({
        data: {
          name: title,
          description,
          questions: {
            create: questions.map((q) => ({
              text: q.text,
            })),
          },
          // Add the subscription to the creating group
          subscribedByGroups: {
            connect: {
              id: groupId
            }
          }
        },
        include: {
          questions: true,
          subscribedByGroups: true
        },
      });

      // Create an answer for the first question as the daily question
      if (createdPackage.questions.length > 0) {
        const firstQuestion = createdPackage.questions[0];
        await prisma.answer.create({
          data: {
            questionId: firstQuestion.id,
            groupId: groupId,
            date: new Date(),
            type: 'PACKAGE',
            votes: {}
          }
        });
      }

      return createdPackage;
    });

    return NextResponse.json(newPackage);
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
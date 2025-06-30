import { prisma } from "@/lib/prisma-client";
import { NextResponse } from "next/server";

function getTodayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET(
  _request: Request,
  { params }: { params: { groupId: string } }
) {
  const { groupId } = params;
  const today = getTodayUTC();

  try {
    // Fetch answers for this group and today, include question details and package info
    const answers = await prisma.answer.findMany({
      where: {
        groupId,
        date: today,
      },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            packageId: true,
          }
        }
      }
    });

    // Prepare response structure
    let globalQuestion = null;
    const packageQuestions: Array<{ id: string; text: string; packageId: string }> = [];

    for (const answer of answers) {
      const q = answer.question;
      if (answer.type === 'GLOBAL') {
        globalQuestion = { id: q.id, text: q.text };
      } else if (answer.type === 'PACKAGE') {
        packageQuestions.push({ id: q.id, text: q.text, packageId: q.packageId });
      }
    }

    return NextResponse.json({
      groupId,
      date: today.toISOString().split('T')[0],
      global: globalQuestion,
      package: packageQuestions,
    });
  } catch (error) {
    console.error('Error fetching daily questions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

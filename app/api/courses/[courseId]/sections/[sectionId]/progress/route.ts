import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string; sectionId: string } }
) => {
  try {
    const { userId } = auth();
    const { isCompleted } = await req.json();
    if (!userId) {
      return new NextResponse("Unauthourized", { status: 401 });
    }
    const { courseId, sectionId } = params;
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }
    const section = await db.section.findUnique({
      where: {
        id: sectionId,
        courseId,
      },
    });
    if (!section) {
      return new NextResponse("Section not found", { status: 404 });
    }
    let progress = await db.progress.findUnique({
      where: {
        studentId_sectionId: {
          studentId: userId,
          sectionId,
        },
      },
    });
    if (progress) {
      progress = await db.progress.update({
        where: {
          studentId_sectionId: {
            studentId: userId,
            sectionId,
          },
        },
        data: {
          isCompleted,
        },
      });
    } else {
      progress = await db.progress.create({
        data: {
          studentId: userId,
          sectionId,
          isCompleted,
        },
      });
    }
    return NextResponse.json(progress, { status: 200 });
  } catch (err) {
    console.log("[sectionId_progress_post_error]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

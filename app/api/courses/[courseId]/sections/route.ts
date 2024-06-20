import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    const { title } = await req.json();
    const { courseId } = params;
    // or
    // const courseId=params.courseId
    if (!userId) {
      return new NextResponse("Unauthourised", { status: 401 });
    }
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return new NextResponse("Course not Found", { status: 404 });
    }
    const lastSection = await db.section.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        position: "desc",
      },
    });
    const newPosition = lastSection ? lastSection.position + 1 : 0;

    const newSection = await db.section.create({
      data: {
        title,
        courseId,
        position: newPosition,
      },
    });
    return NextResponse.json(newSection, { status: 200 });
  } catch (err) {
    console.log("[sections_post_api]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

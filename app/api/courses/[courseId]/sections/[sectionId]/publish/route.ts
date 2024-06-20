import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string; sectionId: string } }
) => {
  try {
    const { userId } = auth();
    const { courseId, sectionId } = params;
    if (!userId) {
      return new NextResponse("Unauthourized", { status: 401 });
    }
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: userId,
      },
    });

    if (!course) {
      return new NextResponse("Course Not Found", { status: 404 });
    }
    const section = await db.section.findUnique({
      where: {
        id: sectionId,
        courseId,
      },
    });

    const muxData = await db.muxData.findUnique({
      where: {
        sectionId,
      },
    });
    if (
      !section ||
      !muxData ||
      !section.title ||
      !section.description ||
      !section.videoUrl
    ) {
      return new NextResponse("Missing required fields", { status: 404 });
    }
    const publishedSection = await db.section.update({
      where: {
        id: sectionId,
        courseId,
      },
      data: {
        isPublished: true,
      },
    });
    return NextResponse.json(publishedSection, { status: 200 });
  } catch (err) {
    console.log("[section_publish_post_error]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

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
    if (!section) {
      return new NextResponse("Section Not Found", { status: 404 });
    }

    const unpublishedSection = await db.section.update({
      where: {
        id: sectionId,
        courseId,
      },
      data: {
        isPublished: false,
      },
    });
    const publishedSectionsInCourse = await db.section.findMany({
      where: {
        id: sectionId,
        courseId,
      },
    });
    if (publishedSectionsInCourse.length === 0) {
      await db.course.update({
        where: {
          id: courseId,
          instructorId: userId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(unpublishedSection, { status: 200 });
  } catch (err) {
    console.log("[section_unpublish_post_error]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

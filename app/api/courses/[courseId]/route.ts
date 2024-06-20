import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Mux from "@mux/mux-node";
import { NextRequest, NextResponse } from "next/server";

const { video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    const courseId = params.courseId;
    const values = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorised", { status: 401 });
    }
    const updatedCourse = await db.course.update({
      where: {
        id: courseId,
        instructorId: userId,
      },
      data: { ...values },
    });
    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (err) {
    console.log("[patch-err-edit-course: ]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    const { courseId } = params;
    if (!userId) {
      return new NextResponse("Unauthorised", { status: 401 });
    }
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: userId,
      },
      include: {
        sections: {
          include: {
            muxData: true,
          },
        },
      },
    });
    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }
    for (const section of course.sections) {
      if (section.muxData?.assetId) {
        await video.assets.delete(section.muxData.assetId);
      }
    }
    await db.course.delete({
      where: {
        id: courseId,
        instructorId: userId,
      },
    });
    return new NextResponse("Course Deleted", { status: 200 });
  } catch (err) {
    console.log("[courseId_delete_error]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

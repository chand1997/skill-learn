import AlertBanner from "@/components/custom/AlertBanner";
import EditSectionForm from "@/components/sections/EditSectionForm";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const SectionDetailsPage = async ({
  params,
}: {
  params: { courseId: string; sectionId: string };
}) => {
  const { userId } = auth();
  const { courseId, sectionId } = params;
  if (!userId) {
    return redirect("sign-in");
  }
  const course = await db.course.findUnique({
    where: {
      id: courseId,
      instructorId: userId,
    },
  });
  if (!course) {
    return redirect("/instructor/courses");
  }
  const section = await db.section.findUnique({
    where: {
      id: sectionId,
      courseId,
    },
    include: {
      resources: true,
      muxData: true,
    },
  });
  if (!section) {
    return redirect(`/instructor/courses/${courseId}/sections`);
  }
  const requiredFields = [section.title, section.description, section.videoUrl];
  const requiredFieldsCount = requiredFields.length;
  const missingFields = requiredFields.filter((field) => !Boolean(field));
  const missingFieldsCount = missingFields.length;
  const isCompleted = requiredFields.every(Boolean);
  return (
    <div className="px-10">
      <AlertBanner
        isCompleted={isCompleted}
        requiredFieldsCount={requiredFieldsCount}
        missingFieldsCount={missingFieldsCount}
      />
      <EditSectionForm
        section={section}
        courseId={courseId}
        isCompleted={isCompleted}
      />
    </div>
  );
};

export default SectionDetailsPage;

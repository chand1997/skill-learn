import { db } from "@/lib/db";
import { Course, Purchase } from "@prisma/client";

type PurchaseWithCourse = Purchase & { course: Course };
const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: { total: number; count: number } } =
    {};
  purchases.forEach((purchase) => {
    if (!grouped[purchase.course.title]) {
      grouped[purchase.course.title] = { total: 0, count: 0 };
    }
    grouped[purchase.course.title].total += purchase.course.price!;
    grouped[purchase.course.title].count += 1;
  });
  return grouped;
};

export const getPerformance = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          instructorId: userId,
        },
      },
      include: {
        course: true,
      },
    });
    const groupedEarnings = groupByCourse(purchases);
    const data = Object.entries(groupedEarnings).map(
      ([courseTitle, { total, count }]) => ({
        name: courseTitle,
        total,
        count,
      })
    );
    const totalRevenue = data.reduce((acc, current) => acc + current.total, 0);
    const totalSales = purchases.length;
    return {
      data,
      totalRevenue,
      totalSales,
    };
  } catch (err) {
    console.log("[getPerformace_error]", err);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};

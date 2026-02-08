import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // N+1 問題を避けるため、集計をデータベース側で行う
    let classesQuery = supabase
      .from("classes")
      .select(
        `
        id,
        name,
        teacher,
        created_at,
        reviews(rating)
      `,
      )
      .order("created_at", { ascending: false });

    // 検索クエリがある場合、フィルタを追加
    if (query.trim()) {
      // 授業名または教員名で検索
      classesQuery = classesQuery.or(
        `name.ilike.%${query}%,teacher.ilike.%${query}%`,
      );
    }

    const { data: classes, error } = await classesQuery;

    if (error) throw error;

    // クライアント側での計算を最小限に
    const classesWithRatings = (classes || []).map((classItem: any) => {
      const reviews = classItem.reviews || [];
      const avgRating =
        reviews.length > 0
          ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
          : null;

      return {
        id: classItem.id,
        name: classItem.name,
        teacher: classItem.teacher,
        created_at: classItem.created_at,
        avgRating,
        reviewCount: reviews.length,
      };
    });

    return NextResponse.json({
      data: classesWithRatings,
      count: classesWithRatings.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search classes" },
      { status: 500 },
    );
  }
}

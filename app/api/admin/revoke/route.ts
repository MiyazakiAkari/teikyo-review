import { createClient } from "@/utils/supabase/server";
import { isUserAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 403 }
      );
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: "userIdが必要です" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: false })
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error revoking admin:", error);
    return NextResponse.json(
      { error: error.message || "権限の取り消しに失敗しました" },
      { status: 500 }
    );
  }
}

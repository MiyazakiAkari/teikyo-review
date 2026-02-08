import { createClient } from "@/utils/supabase/server";
import { isUserAdmin } from "@/lib/admin";
import Link from "next/link";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminStats from "@/components/admin/AdminStats";
import AdminClassManagement from "@/components/admin/AdminClassManagement";
import AdminReviewManagement from "@/components/admin/AdminReviewManagement";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 管理者チェック
  const isAdmin = await isUserAdmin();

  if (!isAdmin || !user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition"
            >
              <span>←</span>
              <span>ホームに戻る</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              <span>👑</span>
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        {/* ページタイトル */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            管理ダッシュボード
          </h1>
          <p className="text-gray-600 text-lg">
            システム統計とユーザー管理を行えます
          </p>
        </div>

        {/* 統計情報 */}
        <AdminStats />

        {/* ユーザー管理 */}
        <div className="mt-12">
          <AdminUserManagement />
        </div>

        {/* 授業管理 */}
        <div className="mt-12">
          <AdminClassManagement />
        </div>

        {/* レビュー管理 */}
        <div className="mt-12">
          <AdminReviewManagement />
        </div>
      </div>
    </div>
  );
}

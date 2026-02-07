// app/page.tsx
import { createClient } from "@/utils/supabase/server";
import { addClass } from "./actions";
import ClassList from "@/components/ClassList";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        {/* ナビゲーション */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <span>👤</span>
                  <span>{user.email}</span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    const sb = await createClient();
                    await sb.auth.signOut();
                  }}
                >
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
                    ログアウト
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  ログイン
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            帝京通信
            <br className="hidden sm:block" /> 授業レビュー
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            帝京大学理工学部情報科学科の授業レビュー共有サイトです。
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto">
        {/* 登録フォーム */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                <span className="text-2xl">✏️</span>
                新しい授業を登録
              </h2>
              {user ? (
                <form action={addClass} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      授業名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      placeholder="例: 情報科学演習1"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      担当教員
                    </label>
                    <input
                      name="teacher"
                      placeholder="例: 帝京 太郎"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300"
                  >
                    + 授業を登録
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🔐</div>
                  <p className="text-gray-600 mb-4 font-semibold">
                    ログインが必要です
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    新しい授業を登録するには、ログインしてください
                  </p>
                  <Link
                    href="/login"
                    className="w-full block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
                  >
                    ログインする
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <span className="text-3xl">📚</span>
              登録済み授業一覧
            </h2>
            <ClassList />
          </div>
        </div>
      </div>
    </main>
  );
}

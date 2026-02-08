import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminDebugPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let debugInfo = {
    loggedIn: false,
    email: "",
    userId: "",
    profileExists: false,
    isAdmin: false,
    error: "",
  };

  if (user) {
    debugInfo.loggedIn = true;
    debugInfo.email = user.email || "";
    debugInfo.userId = user.id;

    try {
      // profiles テーブルから情報を取得
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, email, is_admin")
        .eq("id", user.id)
        .single();

      if (error) {
        debugInfo.error = `プロフィール取得エラー: ${error.message}`;
      } else if (profile) {
        debugInfo.profileExists = true;
        debugInfo.isAdmin = profile.is_admin ?? false;
      } else {
        debugInfo.error = "プロフィールが見つかりません";
      }
    } catch (err: any) {
      debugInfo.error = `エラー: ${err.message}`;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <div className="border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition"
          >
            <span>←</span>
            <span>ホームに戻る</span>
          </Link>
        </div>
      </div>

      {/* デバッグ情報 */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          👑 管理画面アクセス診断
        </h1>

        <div className="space-y-4">
          {/* ログイン状態 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              ログイン状態
            </h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">ステータス: </span>
                <span
                  className={`font-semibold ${
                    debugInfo.loggedIn ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {debugInfo.loggedIn ? "✅ ログイン済み" : "❌ 未ログイン"}
                </span>
              </div>
              {debugInfo.loggedIn && (
                <>
                  <div>
                    <span className="text-gray-600">メール: </span>
                    <span className="font-mono">{debugInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">ユーザーID: </span>
                    <span className="font-mono text-sm">
                      {debugInfo.userId}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* プロフィール状態 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              プロフィール情報
            </h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">存在状態: </span>
                <span
                  className={`font-semibold ${
                    debugInfo.profileExists
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {debugInfo.profileExists ? "✅ 登録済み" : "⚠️ 未登録"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">管理者ステータス: </span>
                <span
                  className={`font-semibold ${
                    debugInfo.isAdmin ? "text-purple-600" : "text-gray-600"
                  }`}
                >
                  {debugInfo.isAdmin ? "👑 管理者" : "👤 通常ユーザー"}
                </span>
              </div>
            </div>
          </div>

          {/* エラー情報 */}
          {debugInfo.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2 text-red-900">
                エラー情報
              </h2>
              <p className="text-red-700">{debugInfo.error}</p>
            </div>
          )}

          {/* 対応方法 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">
              対応方法
            </h2>
            <div className="space-y-3 text-sm text-blue-900">
              {!debugInfo.loggedIn && (
                <div>
                  <p className="font-semibold">❌ 未ログイン</p>
                  <p>まずホームページからログインしてください。</p>
                </div>
              )}

              {debugInfo.loggedIn && !debugInfo.profileExists && (
                <div>
                  <p className="font-semibold">⚠️ プロフィール未登録</p>
                  <p>Supabaseダッシュボードで以下のSQLを実行してください：</p>
                  <code className="block bg-white border border-blue-200 rounded p-2 mt-2 font-mono text-xs overflow-x-auto">
                    INSERT INTO public.profiles (id, email, is_admin)
                    <br />
                    VALUES ('{debugInfo.userId}', '{debugInfo.email}', false);
                  </code>
                </div>
              )}

              {debugInfo.loggedIn &&
                debugInfo.profileExists &&
                !debugInfo.isAdmin && (
                  <div>
                    <p className="font-semibold">👤 通常ユーザー</p>
                    <p>
                      管理者に昇格させるには、以下のコマンドを実行してください：
                    </p>
                    <code className="block bg-white border border-blue-200 rounded p-2 mt-2 font-mono text-xs">
                      npm run admin-promote {debugInfo.email}
                    </code>
                  </div>
                )}

              {debugInfo.loggedIn &&
                debugInfo.profileExists &&
                debugInfo.isAdmin && (
                  <div>
                    <p className="font-semibold">✅ 管理者に昇格済み</p>
                    <p>
                      <Link
                        href="/admin"
                        className="font-semibold text-blue-600 hover:text-blue-700 underline"
                      >
                        管理ダッシュボードにアクセス →
                      </Link>
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* チェックリスト */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            セットアップチェックリスト
          </h2>
          <div className="space-y-2 text-sm">
            <div
              className={`flex items-center gap-2 ${
                debugInfo.loggedIn ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span>{debugInfo.loggedIn ? "✅" : "○"}</span>
              <span>ユーザーでログイン</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                debugInfo.profileExists ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span>{debugInfo.profileExists ? "✅" : "○"}</span>
              <span>profiles テーブルに登録</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                debugInfo.isAdmin ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span>{debugInfo.isAdmin ? "✅" : "○"}</span>
              <span>管理者に昇格</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

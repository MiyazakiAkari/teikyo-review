import { login, signup } from "./actions";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : null;

  // レート制限エラーの判定
  const isRateLimitError =
    error?.includes("上限に達しました") ||
    error?.toLowerCase().includes("rate limit");

  return (
    <div className="min-h-screen bg-white">
      {/* エラーポップアップ */}
      {error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            style={{ animation: "fadeInZoom 0.3s ease-in-out" }}
          >
            <div className="border-t-4 border-red-500 p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    エラーが発生しました
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{error}</p>
                  {isRateLimitError && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      💡 <span className="font-semibold">ヒント:</span>{" "}
                      数時間待ってからもう一度お試しください。複数のメールアドレスでお試しになることもできます。
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/login"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg text-center transition"
                >
                  再度試す
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* メインコンテンツ */}
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* ヘッダー */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              帝京通信
            </h1>
            <p className="text-gray-600">ログイン / 新規登録</p>
          </div>

          {/* フォーム */}
          <form className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition p-8">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  メールアドレス
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
                  <input
                    id="email"
                    name="email"
                    type="text"
                    placeholder="your"
                    required
                    className="flex-1 px-4 py-3 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                  <span className="px-4 py-3 text-gray-500 font-medium pointer-events-none whitespace-nowrap">
                    @stu.teikyo-u.ac.jp
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  メールアドレスの @ より前の部分を入力してください
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  パスワード
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  formAction={login}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300"
                >
                  ログイン
                </button>
                <button
                  formAction={signup}
                  className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition duration-300"
                >
                  新規登録
                </button>
              </div>
            </div>
          </form>

          {/* フッター */}
          <p className="text-center text-sm text-gray-500 mt-6">
            帝京大学理工学部情報科学科の学生限定サービスです
          </p>
        </div>
      </div>
    </div>
  );
}

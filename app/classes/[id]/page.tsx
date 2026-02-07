import { supabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import { addReview } from "@/app/actions";
import Link from "next/link";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  // 1. 授業情報の取得
  const { data: classData } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .single();

  // 2. レビュー一覧の取得
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("class_id", id)
    .order("created_at", { ascending: false });
  if (!classData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            授業が見つかりません
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 transition"
          >
            ← 一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-4 border-b border-gray-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition"
        >
          <span>←</span>
          <span>一覧に戻る</span>
        </Link>
      </div>

      {/* ヘッダー */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            {classData.name}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <span>👨‍🏫</span>
              <span>
                担当教員:{" "}
                <span className="text-gray-900 font-semibold">
                  {classData.teacher || "未設定"}
                </span>
              </span>
            </div>
            {avgRating && (
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span>
                  平均評価:{" "}
                  <span className="text-gray-900 font-semibold">
                    {avgRating} / 5.0
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* レビュー投稿フォーム */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                <span className="text-2xl">✍️</span>
                レビューを書く
              </h2>
              {user ? (
                <form action={addReview} className="flex flex-col gap-4">
                  <input type="hidden" name="class_id" defaultValue={id} />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      評価
                    </label>
                    <select
                      name="rating"
                      defaultValue="5"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
                    >
                      <option value="5">⭐⭐⭐⭐⭐</option>
                      <option value="4">⭐⭐⭐⭐</option>
                      <option value="3">⭐⭐⭐</option>
                      <option value="2">⭐⭐</option>
                      <option value="1">⭐</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      感想・コメント <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="body"
                      rows={6}
                      placeholder="単位は取りやすい？テストの内容は？授業は面白い？課題は多い？"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300"
                  >
                    💬 投稿する
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🔐</div>
                  <p className="text-gray-600 mb-4 font-semibold">
                    ログインが必要です
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    レビューを投稿するには、ログインしてください
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

          {/* レビュー一覧 */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
                <span>💭</span>
                みんなのレビュー
              </h2>
              <p className="text-gray-600 mt-2">
                {reviews?.length || 0} 件のレビュー
              </p>
            </div>

            <div className="space-y-4">
              {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition duration-300 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">
                          {review.rating}
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-gray-900">
                            {"⭐".repeat(Math.floor(review.rating || 0))}
                            {review.rating && review.rating % 1 !== 0
                              ? "✨"
                              : ""}
                          </div>
                          <p className="text-gray-500 text-sm">
                            {new Date(review.created_at).toLocaleDateString(
                              "ja-JP",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {review.body}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="text-5xl mb-4">📝</div>
                  <p className="text-gray-700 text-lg">
                    まだレビューはありません
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    最初の投稿者になりましょう！
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

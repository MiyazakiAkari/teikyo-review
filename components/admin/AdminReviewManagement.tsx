"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

interface Review {
  id: string;
  class_id: string;
  rating: number;
  body: string;
  created_at: string;
  user_id: string;
  profiles: {
    email: string;
  };
}

interface ClassInfo {
  id: string;
  name: string;
}

export default function AdminReviewManagement() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [classes, setClasses] = useState<Map<string, ClassInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // レビューを取得（まずはprofilesなしで試す）
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (reviewsError) {
        console.error("Reviews fetch error:", reviewsError);
        throw reviewsError;
      }

      // ユーザーメールアドレスを別途取得（RLS回避）
      let reviewsWithEmail = reviewsData || [];
      if (reviewsData && reviewsData.length > 0) {
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, email");

          if (!profilesError && profilesData) {
            const profileMap = new Map(profilesData.map((p) => [p.id, p]));
            reviewsWithEmail = reviewsData.map((review) => ({
              ...review,
              profiles: profileMap.get(review.user_id) || { email: "不明" },
            }));
          }
        } catch (err) {
          console.warn("Failed to fetch profiles, continuing without email:", err);
          reviewsWithEmail = reviewsData.map((review) => ({
            ...review,
            profiles: { email: "不明" },
          }));
        }
      }

      // クラス情報を取得
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id, name");

      if (classesError) {
        console.error("Classes fetch error:", classesError);
        throw classesError;
      }

      const classMap = new Map(classesData?.map((c) => [c.id, c]) || []);
      setClasses(classMap);
      setReviews(reviewsWithEmail);
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
      setMessage({
        type: "error",
        text: `レビュー一覧の読み込みに失敗しました: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteReview(reviewId: string) {
    if (!confirm("このレビューを削除してもよろしいですか？")) {
      return;
    }

    try {
      setDeleting(reviewId);
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      setReviews(reviews.filter((r) => r.id !== reviewId));
      setMessage({
        type: "success",
        text: "レビューを削除しました",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      setMessage({
        type: "error",
        text: "レビューの削除に失敗しました",
      });
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">レビュー管理</h3>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-600"
          >
            {/* ヘッダー行 */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-lg text-gray-900">
                    {classes.get(review.class_id)?.name || "不明な授業"}
                  </h4>
                  <span className="text-2xl font-bold text-indigo-600">
                    ★ {review.rating}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>👤 {review.profiles?.email || "不明なユーザー"}</span>
                  <span>
                    📅 {new Date(review.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteReview(review.id)}
                disabled={deleting === review.id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {deleting === review.id ? "削除中..." : "削除"}
              </button>
            </div>

            {/* コメント */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap break-words">
                {review.body}
              </p>
            </div>

            {/* Review ID */}
            <div className="text-xs text-gray-400 mt-3">ID: {review.id}</div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          レビューが投稿されていません
        </div>
      )}
    </div>
  );
}

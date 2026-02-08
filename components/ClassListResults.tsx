import Link from "next/link";
import { StarRating } from "./StarRating";

export interface ClassWithRating {
  id: string;
  name: string;
  teacher: string | null;
  created_at: string;
  avgRating: string | null;
  reviewCount: number;
}

interface ClassListResultsProps {
  classes: ClassWithRating[];
  isLoading?: boolean;
}

export default function ClassListResults({
  classes,
  isLoading = false,
}: ClassListResultsProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">検索中...</p>
      </div>
    );
  }

  if (!classes?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-gray-600 text-lg">該当する授業が見つかりません。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
      {classes.map((item) => (
        <Link
          key={item.id}
          href={`/classes/${item.id}`}
          className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1"
        >
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition">
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm flex items-center gap-2 mb-3">
                <span>👨‍🏫</span>
                {item.teacher || "未設定"}
              </p>
              {/* レビュー平均と件数 */}
              <div className="flex items-center gap-4 text-sm">
                {item.avgRating ? (
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={parseFloat(item.avgRating)}
                      size="w-4 h-4"
                      showLabel={true}
                    />
                    <span className="text-gray-500">/ 5.0</span>
                  </div>
                ) : (
                  <span className="text-gray-400">レビューなし</span>
                )}
                <span className="text-gray-500">
                  ({item.reviewCount} {item.reviewCount === 1 ? "件" : "件"})
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-blue-600 group-hover:text-blue-700 font-semibold text-sm">
              <span>詳細を見る</span>
              <span className="transform group-hover:translate-x-1 transition">
                →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

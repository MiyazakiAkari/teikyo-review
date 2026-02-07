import { supabase } from "@/lib/supabase";

async function getStats() {
  try {
    // ユーザー数
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, is_admin");

    const totalUsers = profiles?.length || 0;
    const adminUsers = profiles?.filter((p) => p.is_admin).length || 0;

    // 授業数
    const { data: classes } = await supabase.from("classes").select("id");

    const totalClasses = classes?.length || 0;

    // レビュー数
    const { data: reviews } = await supabase
      .from("reviews")
      .select("id, rating");

    const totalReviews = reviews?.length || 0;
    const avgRating =
      reviews && reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          ).toFixed(1)
        : 0;

    return {
      totalUsers,
      adminUsers,
      totalClasses,
      totalReviews,
      avgRating,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalUsers: 0,
      adminUsers: 0,
      totalClasses: 0,
      totalReviews: 0,
      avgRating: 0,
    };
  }
}

export default async function AdminStats() {
  const stats = await getStats();

  const statCards = [
    {
      title: "全ユーザー",
      value: stats.totalUsers,
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      desc: `${stats.adminUsers}人の管理者`,
    },
    {
      title: "登録授業",
      value: stats.totalClasses,
      icon: "📚",
      color: "from-indigo-500 to-indigo-600",
      desc: "クラス",
    },
    {
      title: "レビュー数",
      value: stats.totalReviews,
      icon: "💬",
      color: "from-purple-500 to-purple-600",
      desc: `平均 ${stats.avgRating} / 5.0`,
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">
                {card.title}
              </p>
              <p className="text-4xl font-bold">{card.value}</p>
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>
          <p className="text-white/70 text-sm">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}

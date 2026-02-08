"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

interface Class {
  id: string;
  name: string;
  teacher: string;
  created_at: string;
}

export default function AdminClassManagement() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setMessage({
        type: "error",
        text: "授業一覧の読み込みに失敗しました",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteClass(classId: string, className: string) {
    if (!confirm(`「${className}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      setDeleting(classId);
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      setClasses(classes.filter((c) => c.id !== classId));
      setMessage({
        type: "success",
        text: `「${className}」を削除しました`,
      });
    } catch (error) {
      console.error("Error deleting class:", error);
      setMessage({
        type: "error",
        text: "授業の削除に失敗しました",
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
      <h3 className="text-2xl font-bold text-gray-900">授業管理</h3>

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                授業名
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                教員名
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                登録日
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{cls.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {cls.teacher}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(cls.created_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => deleteClass(cls.id, cls.name)}
                    disabled={deleting === cls.id}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting === cls.id ? "削除中..." : "削除"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {classes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            授業が登録されていません
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null,
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage({
        type: "error",
        text: "ユーザー一覧の読み込みに失敗しました",
      });
    } finally {
      setLoading(false);
    }
  }

  async function promoteUser(userId: string, email: string) {
    try {
      setActionLoading(userId);
      const response = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "昇格に失敗しました");
      }

      setMessage({
        type: "success",
        text: `${email} を管理者に昇格させました`,
      });
      fetchUsers();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setActionLoading(null);
    }
  }

  async function revokeUser(userId: string, email: string) {
    try {
      setActionLoading(userId);
      const response = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "権限の取り消しに失敗しました");
      }

      setMessage({
        type: "success",
        text: `${email} の管理者権限を取り消しました`,
      });
      fetchUsers();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-gray-600 mt-4">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <span>👥</span>
        ユーザー管理
      </h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                メールアドレス
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                ステータス
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                登録日
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                アクション
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4 text-gray-900 font-medium">
                  {user.email}
                </td>
                <td className="py-3 px-4">
                  {user.is_admin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      <span>👑</span>
                      管理者
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      <span>👤</span>
                      ユーザー
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {new Date(user.created_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.is_admin ? (
                      <button
                        onClick={() => revokeUser(user.id, user.email)}
                        disabled={actionLoading === user.id}
                        className="px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 rounded transition disabled:opacity-50"
                      >
                        {actionLoading === user.id ? "処理中..." : "権限取消"}
                      </button>
                    ) : (
                      <button
                        onClick={() => promoteUser(user.id, user.email)}
                        disabled={actionLoading === user.id}
                        className="px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded transition disabled:opacity-50"
                      >
                        {actionLoading === user.id
                          ? "処理中..."
                          : "管理者に昇格"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">ユーザーが見つかりません</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          合計: <span className="font-semibold">{users.length}</span> ユーザー
          (管理者:{" "}
          <span className="font-semibold">
            {users.filter((u) => u.is_admin).length}
          </span>
          )
        </p>
      </div>
    </div>
  );
}

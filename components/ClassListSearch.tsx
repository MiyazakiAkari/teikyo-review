"use client";

import { useState, useEffect, useCallback } from "react";
import SearchClasses from "./SearchClasses";
import ClassListResults, { ClassWithRating } from "./ClassListResults";

export default function ClassListSearch() {
  const [classes, setClasses] = useState<ClassWithRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration 完了後に状態を初期化
  useEffect(() => {
    setIsHydrated(true);
    // 初回フェッチを実行
    fetchClasses("");
  }, []);

  // デバウンス処理（500ms の遅延）
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 検索 API を呼び出し
  const fetchClasses = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (query.trim()) {
        params.append("q", query);
      }

      const response = await fetch(`/api/classes/search?${params}`);
      if (!response.ok) throw new Error("検索に失敗しました");

      const result = await response.json();
      setClasses(result.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // デバウンスされたクエリが変更されたら検索
  useEffect(() => {
    if (isHydrated && debouncedQuery !== "") {
      fetchClasses(debouncedQuery);
    }
  }, [debouncedQuery, fetchClasses, isHydrated]);

  // Hydration 完了までは何も表示しない
  if (!isHydrated) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      <SearchClasses onSearch={setSearchQuery} isLoading={isLoading} />
      <ClassListResults classes={classes} isLoading={isLoading} />
    </div>
  );
}

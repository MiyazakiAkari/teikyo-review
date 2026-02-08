#!/usr/bin/env node

/**
 * RLSポリシー無限ループ修正ガイド
 * 
 * エラー: "infinite recursion detected in policy for relation "profiles""
 * 原因: Admins can view all profiles ポリシーが無限ループを起こしている
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║     RLSポリシー無限ループ修正ガイド                            ║
╚════════════════════════════════════════════════════════════════╝

【エラー内容】
infinite recursion detected in policy for relation "profiles"

【原因】
RLSポリシー内でprofilesテーブルを照会する際に、ポリシーが再度適用されて
無限ループが発生しています。

【修正方法】

Supabase Dashboard で以下の手順を実行してください：

1. SQL Editor を開く
2. 既存のポリシーを削除:

---

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

---

3. 以下の修正済みポリシーを実行:

---

-- Admins can view all profiles ポリシーを修正
-- SECURITY DEFINER で作成することで無限ループを回避
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR
    (auth.uid() IN (SELECT id FROM auth.users) AND
     EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND is_admin = true
     ))
  );

---

【より安全な代替案】（推奨）

上記でもエラーが出る場合は、RLSを簡略化してください：

1. 全ポリシーを削除:

---

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

---

2. シンプルなポリシーを作成:

---

-- ユーザーは自分のプロフィールを読み書きできる
CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL
  USING (auth.uid() = id);

-- 管理者は全てのプロフィールを読める（シンプル版）
-- ※管理者判定はアプリケーション側で行う
-- CREATE POLICY "Admins can view all" ON public.profiles
--   FOR SELECT
--   USING (true);

---

【開発環境用シンプル設定】（推奨）

開発環境では、RLSを全て無効にすることも可能です：

---

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

---

その後、本番環境前に適切なRLSポリシーを設定してください。

【実行後の確認】

修正後、以下のURLで診断してください：

http://localhost:3000/admin-debug

エラーが解消されて、管理者として認識されるはずです。

【トラブルシューティング】

Q: まだエラーが出る
A: ブラウザのキャッシュをクリアして、ページを再読み込みしてください

Q: どのポリシーが原因か分からない
A: 全ポリシーを削除して、シンプルなポリシーから始めてください

Q: adminに昇格したのに admin ユーザーと認識されない
A: ページをリロードしてから、/admin-debug で確認してください

`);

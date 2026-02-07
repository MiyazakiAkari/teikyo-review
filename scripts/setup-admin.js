#!/usr/bin/env node

/**
 * Supabase セットアップガイド
 * 管理者機能を有効にするためのセットアップ手順を表示します
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║        Supabase 管理者機能セットアップガイド                   ║
╚════════════════════════════════════════════════════════════════╝

【現在の状況】
❌ profiles テーブルがまだ作成されていません

【セットアップ手順】

【方法1】Supabase ダッシュボード（推奨）

1. Supabase Dashboard にアクセス: https://app.supabase.com
2. プロジェクトを選択
3. 左メニューの「SQL Editor」を選択
4. 「New Query」をクリック
5. 以下のSQLコードを【全て】コピー＆ペースト:

---

-- Step 1: Public profilesテーブル作成
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  is_admin boolean DEFAULT false,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp WITH time zone DEFAULT timezone('utc'::text, now())
);

-- Step 2: インデックス作成
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Step 3: RLS（Row Level Security）有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4-1: RLSポリシー - ユーザーが自分のプロフィールを閲覧
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Step 4-2: RLSポリシー - ユーザーが自分のプロフィールを更新
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 4-3: RLSポリシー - 管理者が全てのプロフィールを閲覧
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Step 5: トリガー関数作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

---

6. 「Run」をクリック
7. 成功したら、次のクエリを別途実行:

---

-- トリガー作成（前のクエリが成功した後に実行）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

---

※ こちらは「destructive operation」という警告が出ます。
   「Confirm」ボタンを押して進めてください。

【既存ユーザーをプロフィールに登録】

既に認証済みユーザーがいる場合、以下のSQLを実行：

---

INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, false FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

---

【特定ユーザーを管理者にする】

テーブル作成後、以下を実行して特定ユーザーを管理者に設定：

---

UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'your-email@stu.teikyo-u.ac.jp';

---

【実行後の確認】

以下のコマンドで確認できます：

npm run admin-list                              # 全ユーザー表示
npm run admin-promote <email>                   # ユーザーを管理者に昇格
npm run admin-revoke <email>                    # 管理者権限を取り消し

【トラブルシューティング】

Q: "Could not find the table 'public.profiles'" エラーが出る
A: Step 1-5 のSQLが正常に実行されたか確認してください

Q: トリガーの実行で "destructive operation" 警告が出る
A: これは正常です。「Confirm」ボタンを押して進めてください

Q: "User not found" エラーが出る
A: ユーザーが profiles テーブルに存在しない可能性があります。
   上記の「既存ユーザーをプロフィールに登録」を実行してください

Q: Permission denied エラーが出る
A: SUPABASE_SERVICE_KEY が正しく設定されているか確認してください

【セットアップチェックリスト】

✓ Step 1-5: テーブル、インデックス、ポリシー、トリガー関数を作成
✓ トリガー実行: on_auth_user_created トリガーを作成
✓ 既存ユーザー登録: 既存ユーザーを profiles テーブルに登録（必要な場合）
✓ 管理者設定: 特定ユーザーを管理者に設定

【次のステップ】

全てのSQLが実行できたら、アプリケーションで以下が可能になります：

npm run admin-list                              # 全ユーザー表示
npm run admin-promote test1@stu.teikyo-u.ac.jp # 管理者に昇格
npm run admin-revoke test1@stu.teikyo-u.ac.jp  # 権限取り消し


`);

# テストユーザの作成方法

開発環境でログインをテストするために、以下の手順でテストユーザを作成してください。

## 前提条件

1. `.env.local` ファイルに以下の環境変数が設定されていることを確認してください：
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の公開キー
   - `SUPABASE_SERVICE_KEY`: Supabase のサービスロールキー（テストユーザ作成に必要）

## テストユーザの作成

以下のコマンドを実行してテストユーザを作成します：

```bash
npm run create-test-user
```

## デフォルトテストユーザ

以下のテストユーザが自動的に作成されます：

| メールアドレス           | パスワード       |
| ------------------------ | ---------------- |
| test1@stu.teikyo-u.ac.jp | TestPassword123! |
| test2@stu.teikyo-u.ac.jp | TestPassword456! |
| test3@stu.teikyo-u.ac.jp | TestPassword789! |

## ログイン手順

1. アプリケーションを起動します：

   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:3000` を開きます

3. ヘッダーの「ログイン」ボタンをクリックします

4. 上記のテストユーザ情報を入力してログインします

## カスタマイズ

`scripts/create-test-user.js` を編集して、異なるテストユーザを作成することもできます。

### 例：メールアドレスやパスワードを変更する場合

```javascript
const testUsers = [
  {
    email: "custom@stu.teikyo-u.ac.jp",
    password: "CustomPassword123!",
    displayName: "カスタムユーザ",
  },
];
```

## トラブルシューティング

### "SUPABASE_SERVICE_KEY is not set" エラーが出る場合

- `.env.local` ファイルに `SUPABASE_SERVICE_KEY` が設定されているか確認してください
- Supabase プロジェクトの「Settings > API」からサービスロールキーを取得できます

### "already exists" メッセージが出る場合

- テストユーザが既に作成されている状態です
- ログイン画面でそのユーザでログインができます

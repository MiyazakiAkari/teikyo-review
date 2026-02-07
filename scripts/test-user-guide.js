#!/usr/bin/env node

/**
 * テストユーザ作成ガイド
 * SUPABASE_SERVICE_KEY がない場合の代替方法
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║          テストユーザ作成ガイド - 2つの方法があります         ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('【方法1】Supabase ダッシュボードから直接作成（推奨）\n');
console.log('  1. Supabase Dashboard にアクセス: https://app.supabase.com');
console.log('  2. プロジェクトを選択');
console.log('  3. 左メニューの「Authentication」> 「Users」を選択');
console.log('  4. 「Add user」ボタンをクリック');
console.log('  5. 以下の情報を入力してユーザを作成:\n');

const testUsers = [
  {
    email: 'test1@stu.teikyo-u.ac.jp',
    password: 'TestPassword123!',
  },
  {
    email: 'test2@stu.teikyo-u.ac.jp',
    password: 'TestPassword456!',
  },
  {
    email: 'test3@stu.teikyo-u.ac.jp',
    password: 'TestPassword789!',
  }
];

testUsers.forEach((user, index) => {
  console.log(`  テストユーザ${index + 1}:`);
  console.log(`    メール: ${user.email}`);
  console.log(`    パスワード: ${user.password}`);
  console.log(`    メール確認: チェック ON`);
  console.log('');
});

console.log('─────────────────────────────────────────────────────────────────\n');

console.log('【方法2】コマンドラインで自動作成\n');
console.log('  前提条件: Service Role Key が .env.local に設定されていること\n');
console.log('  1. Supabase Dashboard の Settings > API から「Service Role Key」をコピー');
console.log('  2. .env.local に以下を追加:');
console.log('     SUPABASE_SERVICE_KEY=<コピーしたキー>\n');
console.log('  3. 以下のコマンドを実行:');
console.log('     npm run create-test-user\n');

console.log('─────────────────────────────────────────────────────────────────\n');

console.log('【設定状況の確認】\n');

let hasServiceKey = false;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  hasServiceKey = envContent.includes('SUPABASE_SERVICE_KEY');
  
  console.log(`  .env.local ファイル: ✓ 存在`);
  console.log(`  SUPABASE_SERVICE_KEY: ${hasServiceKey ? '✓ 設定済み' : '✗ 未設定'}`);
} else {
  console.log(`  .env.local ファイル: ✗ 見つかりません`);
}

console.log('\n【現在のテストユーザ設定】\n');
testUsers.forEach(user => {
  console.log(`メール: ${user.email}`);
  console.log(`パスワード: ${user.password}\n`);
});

console.log('╚════════════════════════════════════════════════════════════════╝\n');

if (hasServiceKey) {
  console.log('💡 Service Role Key が設定されているので、以下で自動作成できます:');
  console.log('   npm run create-test-user\n');
}

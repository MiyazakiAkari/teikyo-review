#!/usr/bin/env node

/**
 * テストユーザ作成スクリプト
 * 使用方法: node scripts/create-test-user.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_KEY is not set in .env.local');
  console.error('Please check your environment variables.');
  console.error('\n【Supabase Service Role Key の取得方法】');
  console.error('1. Supabase Dashboard (https://app.supabase.com) にアクセス');
  console.error('2. プロジェクトを選択');
  console.error('3. 左メニューの「Settings」 > 「API」を選択');
  console.error('4. 「Service Role Key」をコピー');
  console.error('5. .env.local に以下を追加:');
  console.error('   SUPABASE_SERVICE_KEY=<コピーしたキー>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// テストユーザのリスト
const testUsers = [
  {
    email: 'test1@stu.teikyo-u.ac.jp',
    password: 'TestPassword123!',
    displayName: 'テストユーザ1'
  },
  {
    email: 'test2@stu.teikyo-u.ac.jp',
    password: 'TestPassword456!',
    displayName: 'テストユーザ2'
  },
  {
    email: 'test3@stu.teikyo-u.ac.jp',
    password: 'TestPassword789!',
    displayName: 'テストユーザ3'
  }
];

async function createTestUsers() {
  console.log('🔄 テストユーザを作成しています...\n');

  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          displayName: user.displayName
        }
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✓ ${user.email} は既に存在します`);
        } else {
          console.error(`❌ ${user.email} の作成に失敗しました:`, error.message);
        }
      } else {
        console.log(`✅ ${user.email} を作成しました`);
        console.log(`   パスワード: ${user.password}\n`);
      }
    } catch (error) {
      console.error(`❌ エラーが発生しました:`, error.message);
    }
  }

  console.log('\n✅ テストユーザの作成が完了しました！\n');
  console.log('テストユーザのログイン情報:');
  console.log('─────────────────────────────────────────');
  testUsers.forEach(user => {
    console.log(`メール: ${user.email}`);
    console.log(`パスワード: ${user.password}`);
    console.log('─────────────────────────────────────────');
  });
}

createTestUsers();

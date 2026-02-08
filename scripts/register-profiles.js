#!/usr/bin/env node

/**
 * プロフィール自動登録スクリプト
 * 使用方法: npm run register-profiles
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_KEY is not set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function registerProfiles() {
  try {
    console.log('\n🔄 プロフィール登録を開始します...\n');

    // auth.users から全ユーザーを取得
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`認証ユーザー取得エラー: ${authError.message}`);
    }

    if (!authUsers || authUsers.users.length === 0) {
      console.log('❌ ユーザーが見つかりません');
      return;
    }

    console.log(`📋 認証ユーザー: ${authUsers.users.length} 件`);

    // 既存プロフィールを取得
    const { data: existingProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id');

    if (profileError) {
      throw new Error(`プロフィール取得エラー: ${profileError.message}`);
    }

    const existingIds = new Set(existingProfiles?.map((p) => p.id) || []);

    // 登録されていないユーザーを抽出
    const usersToRegister = authUsers.users.filter(
      (u) => !existingIds.has(u.id)
    );

    if (usersToRegister.length === 0) {
      console.log('✅ 全ユーザーが既に登録されています\n');
      return;
    }

    console.log(`\n👤 未登録ユーザー: ${usersToRegister.length} 件\n`);

    // プロフィール登録
    const profiles = usersToRegister.map((user) => ({
      id: user.id,
      email: user.email,
      is_admin: false,
    }));

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profiles);

    if (insertError) {
      throw new Error(`プロフィール登録エラー: ${insertError.message}`);
    }

    console.log('✅ プロフィール登録が完了しました\n');
    console.log('登録されたユーザー:');
    console.log('─────────────────────────────────────────────────');

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.email}`);
    });

    console.log('─────────────────────────────────────────────────\n');
    console.log('次のコマンドでユーザーを管理者に昇格できます：');
    console.log(`npm run admin-promote <email>\n`);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

registerProfiles();

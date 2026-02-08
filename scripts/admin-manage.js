#!/usr/bin/env node

/**
 * 管理者ユーザー管理スクリプト
 * 使用方法:
 *   node scripts/admin-manage.js list                    # 全ユーザー表示
 *   node scripts/admin-manage.js promote <email>         # 管理者に昇格
 *   node scripts/admin-manage.js revoke <email>          # 管理者権限取り消し
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_KEY is not set in .env.local');
  console.error('Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listUsers() {
  console.log('\n📋 全ユーザー一覧\n');
  console.log('─────────────────────────────────────────────────────────────');

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, is_admin, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!users || users.length === 0) {
      console.log('ユーザーが見つかりません');
      return;
    }

    users.forEach((user, index) => {
      const adminBadge = user.is_admin ? '👑 管理者' : '   ユーザー';
      const createdDate = new Date(user.created_at).toLocaleDateString('ja-JP');
      console.log(`${index + 1}. ${adminBadge} | ${user.email} (${createdDate})`);
    });

    console.log('─────────────────────────────────────────────────────────────\n');
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function promoteUser(email) {
  console.log(`\n✨ ${email} を管理者に昇格させます...\n`);

  try {
    // ユーザーを検索
    const { data: user, error: searchError } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('email', email)
      .single();

    if (searchError || !user) {
      console.error(`❌ ユーザーが見つかりません: ${email}`);
      return;
    }

    if (user.is_admin) {
      console.log(`⚠️  ${email} は既に管理者です`);
      return;
    }

    // 昇格
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id);

    if (updateError) throw updateError;

    console.log(`✅ ${email} を管理者に昇格させました`);
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function revokeUser(email) {
  console.log(`\n⛔ ${email} の管理者権限を取り消します...\n`);

  try {
    // ユーザーを検索
    const { data: user, error: searchError } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('email', email)
      .single();

    if (searchError || !user) {
      console.error(`❌ ユーザーが見つかりません: ${email}`);
      return;
    }

    if (!user.is_admin) {
      console.log(`⚠️  ${email} は管理者ではありません`);
      return;
    }

    // 権限取り消し
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', user.id);

    if (updateError) throw updateError;

    console.log(`✅ ${email} の管理者権限を取り消しました`);
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

function showUsage() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              管理者ユーザー管理スクリプト                      ║
╚════════════════════════════════════════════════════════════════╝

【使用方法】

  npm run admin-list                           全ユーザーを表示
  npm run admin-promote <email>                ユーザーを管理者に昇格
  npm run admin-revoke <email>                 管理者権限を取り消し

【例】

  npm run admin-promote test1@stu.teikyo-u.ac.jp
  npm run admin-revoke test1@stu.teikyo-u.ac.jp
  npm run admin-list

`);
}

const command = process.argv[2];
const email = process.argv[3];

switch (command) {
  case 'list':
    listUsers();
    break;
  case 'promote':
    if (!email) {
      console.error('❌ メールアドレスを指定してください');
      showUsage();
    } else {
      promoteUser(email);
    }
    break;
  case 'revoke':
    if (!email) {
      console.error('❌ メールアドレスを指定してください');
      showUsage();
    } else {
      revokeUser(email);
    }
    break;
  default:
    showUsage();
}

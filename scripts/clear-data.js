#!/usr/bin/env node

/**
 * データベースの授業とレビューをすべて削除するスクリプト
 * 使用方法: npm run clear-data
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

async function clearData() {
  try {
    console.log('\n⚠️  警告: このコマンドはデータベースの全ての授業とレビューを削除します。\n');

    // --force フラグが指定されているかチェック
    const forceFlag = process.argv.includes('--force');

    if (!forceFlag) {
      console.log('実行: npm run clear-data -- --force\n');
      process.exit(1);
    }

    try {
      console.log('\n🔄 処理を開始します...\n');

        // まずレビューを削除（reviews は classes の外部キーを参照）
        console.log('📋 レビューを削除中...');
        const { error: reviewsError } = await supabase
          .from('reviews')
          .delete()
          .neq('id', -1);  // すべてのレコードを削除

        if (reviewsError) {
          throw new Error(`レビュー削除エラー: ${reviewsError.message}`);
        }

        console.log('✅ レビューを削除しました\n');

        // 次に授業を削除
        console.log('🎓 授業を削除中...');
        const { error: classesError } = await supabase
          .from('classes')
          .delete()
          .neq('id', -1);  // すべてのレコードを削除

        if (classesError) {
          throw new Error(`授業削除エラー: ${classesError.message}`);
        }

        console.log('✅ 授業を削除しました\n');

        // 最終確認
        console.log('🔍 削除後のデータ確認...');
        const { data: remainingClasses } = await supabase
          .from('classes')
          .select('id', { count: 'exact', head: true });

        const { data: remainingReviews } = await supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true });

        console.log('─────────────────────────────────────────────────');
        console.log('✨ データベースがリセットされました\n');
        console.log(`📊 残存レコード数:`);
        console.log(`   • 授業: ${remainingClasses?.length || 0} 件`);
        console.log(`   • レビュー: ${remainingReviews?.length || 0} 件`);
        console.log('─────────────────────────────────────────────────\n');
      } catch (error) {
        console.error('❌ エラーが発生しました:', error.message);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ エラーが発生しました:', error.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

clearData();

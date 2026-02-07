'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// エラーメッセージを日本語に翻訳する関数
function translateErrorMessage(errorMessage: string): string {
  if (!errorMessage) return '予期しないエラーが発生しました。';
  
  const lowerError = errorMessage.toLowerCase();
  
  const errorMap: { [key: string]: string } = {
    'rate limit': 'メール送信回数が上限に達しました。しばらく時間を置いて再度お試しください。',
    'invalid login credentials': 'メールアドレスまたはパスワードが正しくありません。',
    'user already registered': 'このメールアドレスは既に登録されています。',
    'email not confirmed': 'メールアドレスの確認が必要です。登録時に送信されたメールを確認してください。',
    'invalid email': 'メールアドレスの形式が正しくありません。',
    'weak password': 'パスワードがセキュリティ要件を満たしていません。より強力なパスワードを使用してください。',
    'user not found': 'このメールアドレスは登録されていません。',
  };

  for (const [englishError, japaneseError] of Object.entries(errorMap)) {
    if (lowerError.includes(englishError)) {
      return japaneseError;
    }
  }

  // マッチしない場合は元のメッセージをそのまま返す
  return errorMessage;
}

export async function login(formData: FormData) {
    const supabase = await createClient();

    let email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email) {
        const message = encodeURIComponent('メールアドレスを入力してください');
        redirect(`/login?error=${message}`);
    }

    // メールアドレスにドメインを追加
    if (!email.includes('@')) {
        email = `${email}@stu.teikyo-u.ac.jp`;
    } else if (!email.endsWith('@stu.teikyo-u.ac.jp')) {
        const message = encodeURIComponent('帝京大学のメールアドレス（@stu.teikyo-u.ac.jp）を使用してください');
        redirect(`/login?error=${message}`);
    }

    const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        const errorMessage = translateErrorMessage(error.message);
        const message = encodeURIComponent(errorMessage);
        redirect(`/login?error=${message}`);
    }
    
    revalidatePath('/', 'layout');
    redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  let email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email) {
    const message = encodeURIComponent('メールアドレスを入力してください');
    redirect(`/login?error=${message}`);
  }

  // メールアドレスにドメインを追加
  if (!email.includes('@')) {
    email = `${email}@stu.teikyo-u.ac.jp`;
  } else if (!email.endsWith('@stu.teikyo-u.ac.jp')) {
    const message = encodeURIComponent('帝京大学のメールアドレス（@stu.teikyo-u.ac.jp）を使用してください');
    redirect(`/login?error=${message}`);
  }

  if (!password || password.length < 6) {
    const message = encodeURIComponent('パスワードは6文字以上である必要があります');
    redirect(`/login?error=${message}`);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    const errorMessage = translateErrorMessage(error.message);
    const message = encodeURIComponent(errorMessage);
    redirect(`/login?error=${message}`);
  }

  revalidatePath('/', 'layout')
  redirect('/')
}


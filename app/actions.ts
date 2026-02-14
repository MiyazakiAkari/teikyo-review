'use server';

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function addClass(formData: FormData) {
    const name = formData.get('name') as string;
    const teacher = formData.get('teacher') as string;

    if (!name || !name.trim()) {
        throw new Error('クラス名は必須です');
    }

    const { error } = await supabase.from('classes').insert([{ name, teacher }]);

    if (error) {
        console.error('クラス追加エラー:', error);
        throw error;
    }

    revalidatePath('/');
}

export async function addReview(formData: FormData) {
    const classId = formData.get('class_id');
    const body = formData.get('body') as string;
    const rating = formData.get('rating');

    if (!classId || !body || !body.trim()) {
        throw new Error('レビュー内容は必須です');
    }

    // ユーザー認証情報を取得
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
        throw new Error('ログインが必要です');
    }

    const { error } = await supabase.from('reviews').insert({
        class_id: classId,
        body,
        rating: rating ? Number(rating) : null,
    });

    if (error) {
        console.error('レビュー追加エラー:', error);
        throw error;
    }

    revalidatePath(`/classes/${classId}`);
    revalidatePath('/', 'layout');
}

import { createClient } from "@/utils/supabase/server";

/**
 * 現在のユーザーが管理者かどうかを確認
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    return profile?.is_admin ?? false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * ユーザーIDが管理者かどうかを確認
 */
export async function isUserAdminById(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    return profile?.is_admin ?? false;
  } catch (error) {
    console.error("Error checking admin status for user:", error);
    return false;
  }
}

/**
 * ユーザーを管理者に昇格させる（管理者のみ）
 */
export async function promoteUserToAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const isAdmin = await isUserAdmin();

    if (!isAdmin) {
      throw new Error("権限がありません。管理者のみが実行できます。");
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return false;
  }
}

/**
 * ユーザーの管理者権限を取り消す（管理者のみ）
 */
export async function revokeAdminFromUser(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const isAdmin = await isUserAdmin();

    if (!isAdmin) {
      throw new Error("権限がありません。管理者のみが実行できます。");
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: false })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error revoking admin from user:", error);
    return false;
  }
}

/**
 * 全ユーザーのリストを取得（管理者のみ）
 */
export async function getAllUsers(): Promise<
  Array<{
    id: string;
    email: string;
    is_admin: boolean;
    created_at: string;
  }>
> {
  try {
    const supabase = await createClient();
    const isAdmin = await isUserAdmin();

    if (!isAdmin) {
      throw new Error("権限がありません。管理者のみが実行できます。");
    }

    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, is_admin, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return users ?? [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

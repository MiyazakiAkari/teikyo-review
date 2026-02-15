import { addReview } from '@/app/actions';
import * as supabaseModule from '@/lib/supabase';
import * as serverModule from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import * as supabaseLib from '@supabase/supabase-js';

// モックの設定
jest.mock('@supabase/supabase-js');
jest.mock('@/utils/supabase/server');
jest.mock('next/cache');
jest.mock('@/lib/supabase');

describe('addReview Action', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@stu.teikyo-u.ac.jp',
  };

  const mockClass = {
    id: 'class-123',
    name: 'プログラミング基礎',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('成功ケース', () => {
    it('有効なレビューデータで投稿できる', async () => {
      // Supabase モック設定
      const mockInsert = jest.fn().mockResolvedValueOnce({ error: null });
      const mockSupabaseInstance = {
        from: jest.fn().mockReturnValueOnce({
          insert: mockInsert,
        }),
      };
      (supabaseModule.supabase as any) = mockSupabaseInstance;

      (serverModule.createClient as jest.Mock).mockResolvedValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
      });

      // フォームデータ作成
      const formData = new FormData();
      formData.set('class_id', mockClass.id);
      formData.set('body', 'この授業は面白い！');
      formData.set('rating', '5');

      // 実行
      await addReview(formData);

      // 確認
      expect(mockInsert).toHaveBeenCalledWith({
        class_id: mockClass.id,
        body: 'この授業は面白い！',
        rating: 5,
      });

      expect(revalidatePath).toHaveBeenCalledWith(`/classes/${mockClass.id}`);
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    });

    it('レーティングなしでもレビューを投稿できる', async () => {
      const mockInsert = jest.fn().mockResolvedValueOnce({ error: null });
      const mockSupabaseInstance = {
        from: jest.fn().mockReturnValueOnce({
          insert: mockInsert,
        }),
      };
      (supabaseModule.supabase as any) = mockSupabaseInstance;

      (serverModule.createClient as jest.Mock).mockResolvedValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
      });

      const formData = new FormData();
      formData.set('class_id', mockClass.id);
      formData.set('body', 'このクラス良かった');

      await addReview(formData);

      expect(mockInsert).toHaveBeenCalledWith({
        class_id: mockClass.id,
        body: 'このクラス良かった',
        rating: null,
      });
    });
  });

  describe('失敗ケース', () => {
    it('本文が空の場合はエラーを投げる', async () => {
      const formData = new FormData();
      formData.set('class_id', mockClass.id);
      formData.set('body', '');

      await expect(addReview(formData)).rejects.toThrow(
        'レビュー内容は必須です'
      );
    });

    it('class_idがない場合はエラーを投げる', async () => {
      const formData = new FormData();
      formData.set('body', 'テスト');

      await expect(addReview(formData)).rejects.toThrow(
        'レビュー内容は必須です'
      );
    });

    it('ログインしていない場合はエラーを投げる', async () => {
      (serverModule.createClient as jest.Mock).mockResolvedValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValueOnce({
            data: { user: null },
          }),
        },
      });

      const formData = new FormData();
      formData.set('class_id', mockClass.id);
      formData.set('body', 'テスト');

      await expect(addReview(formData)).rejects.toThrow(
        'ログインが必要です'
      );
    });

    it('データベースエラーが発生した場合は例外を投げる', async () => {
      const dbError = {
        message: 'Database connection error',
        code: '08P01',
      };

      const mockInsert = jest.fn().mockResolvedValueOnce({ 
        error: dbError,
      });
      const mockSupabaseInstance = {
        from: jest.fn().mockReturnValueOnce({
          insert: mockInsert,
        }),
      };
      (supabaseModule.supabase as any) = mockSupabaseInstance;

      (serverModule.createClient as jest.Mock).mockResolvedValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
      });

      const formData = new FormData();
      formData.set('class_id', mockClass.id);
      formData.set('body', 'テスト');

      // 直接try/catchで確認
      let threwError = false;
      try {
        await addReview(formData);
      } catch (error) {
        threwError = true;
        expect(error).toEqual(dbError);
      }
      expect(threwError).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('本文が空白のみの場合はエラーを投げる', async () => {
      const formData = new FormData();
      formData.set('class_id', mockClass.id);
      formData.set('body', '   ');

      await expect(addReview(formData)).rejects.toThrow(
        'レビュー内容は必須です'
      );
    });

    it('レーティングが文字列の数値で正しく変換される', async () => {
      const mockInsert = jest.fn().mockResolvedValueOnce({ error: null });
      const mockSupabaseInstance = {
        from: jest.fn().mockReturnValueOnce({
          insert: mockInsert,
        }),
      };
      (supabaseModule.supabase as any) = mockSupabaseInstance;

      (serverModule.createClient as jest.Mock).mockResolvedValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
      });

      const formData = new FormData();
      formData.set('class_id', mockClass.id);
      formData.set('body', 'テスト');
      formData.set('rating', '3');

      await addReview(formData);

      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall.rating).toBe(3);
      expect(typeof insertCall.rating).toBe('number');
    });
  });
});

import { GET } from '@/app/api/classes/search/route';
import * as supabaseLib from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

jest.mock('@supabase/supabase-js');

function createNextRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('GET /api/classes/search', () => {
  const mockClasses = [
    {
      id: 'class-1',
      name: 'プログラミング基礎',
      teacher: '帝京 太郎',
      created_at: '2026-02-10',
      reviews: [
        { rating: 4 },
        { rating: 5 },
      ],
    },
    {
      id: 'class-2',
      name: 'データベース設計',
      teacher: '山田 次郎',
      created_at: '2026-02-11',
      reviews: [
        { rating: 3 },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('成功ケース', () => {
    it('クエリなしで全クラスを返す', async () => {
      // モック: select().order() チェーン
      const mockAndChain = {
        data: mockClasses,
        error: null,
      };

      (supabaseLib.createClient as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce(mockAndChain),
          }),
        }),
      } as any);

      const request = createNextRequest('http://localhost:3000/api/classes/search');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.count).toBe(2);
      expect(data.data[0]).toHaveProperty('avgRating');
      expect(data.data[0]).toHaveProperty('reviewCount');
    });

    it('クエリで授業を検索できる', async () => {
      const filteredClass = [mockClasses[0]];
      const mockAndChain = {
        data: filteredClass,
        error: null,
      };

      (supabaseLib.createClient as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockReturnValueOnce({
              or: jest.fn().mockResolvedValueOnce(mockAndChain),
            }),
          }),
        }),
      } as any);

      const request = createNextRequest('http://localhost:3000/api/classes/search?q=プログラミング');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('プログラミング基礎');
    });

    it('レビュー平均を正しく計算する', async () => {
      const mockAndChain = {
        data: mockClasses,
        error: null,
      };

      (supabaseLib.createClient as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce(mockAndChain),
          }),
        }),
      } as any);

      const request = createNextRequest('http://localhost:3000/api/classes/search');
      const response = await GET(request);
      const data = await response.json();

      const firstClass = data.data[0];
      expect(firstClass.avgRating).toBe('4.5'); // (4 + 5) / 2 = 4.5
      expect(firstClass.reviewCount).toBe(2);
    });

    it('レビューなしのクラスは平均がnullになる', async () => {
      const classNoReviews = {
        ...mockClasses[0],
        reviews: [],
      };

      const mockAndChain = {
        data: [classNoReviews],
        error: null,
      };

      (supabaseLib.createClient as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce(mockAndChain),
          }),
        }),
      } as any);

      const request = createNextRequest('http://localhost:3000/api/classes/search');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data[0].avgRating).toBeNull();
      expect(data.data[0].reviewCount).toBe(0);
    });
  });

  describe('エラーケース', () => {
    it('設定エラーの場合は500を返す', async () => {
      // 環境変数がない場合のエラー
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.SUPABASE_SERVICE_KEY;

      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_KEY;

      const request = createNextRequest('http://localhost:3000/api/classes/search');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Server configuration error');

      // 復元
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      process.env.SUPABASE_SERVICE_KEY = originalKey;
    });

    it('データベースエラーの場合は500を返す', async () => {
      const dbError = {
        message: 'Database error',
        code: '42P01',
      };

      (supabaseLib.createClient as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: null,
              error: dbError,
            }),
          }),
        }),
      } as any);

      const request = createNextRequest('http://localhost:3000/api/classes/search');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('レスポンス形式', () => {
    it('正しい形式でデータを返す', async () => {
      const mockAndChain = {
        data: mockClasses,
        error: null,
      };

      (supabaseLib.createClient as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce(mockAndChain),
          }),
        }),
      } as any);

      const request = createNextRequest('http://localhost:3000/api/classes/search');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('count');
      expect(Array.isArray(data.data)).toBe(true);

      data.data.forEach((item: any) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('teacher');
        expect(item).toHaveProperty('created_at');
        expect(item).toHaveProperty('avgRating');
        expect(item).toHaveProperty('reviewCount');
      });
    });
  });
});


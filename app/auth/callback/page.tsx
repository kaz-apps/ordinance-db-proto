'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (token && type) {
        await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });
      }

      // 認証完了後、マイページまたはホームページにリダイレクト
      router.push('/mypage');
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">認証処理中...</h2>
        <p>しばらくお待ちください。</p>
      </div>
    </div>
  );
} 
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/app/utils/supabase'
import { useSnackbar } from "@/contexts/SnackbarContext"

export default function Navigation() {
  const [session, setSession] = useState<any>(null)
  const router = useRouter()
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      showSnackbar("ログアウトしました", "success")
    } catch (error) {
      showSnackbar("ログアウトに失敗しました", "error")
    }
  }

  return (
    <header className="bg-primary border-b border-border">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-xl font-bold text-white hover:text-background transition-colors"
        >
          条例DB
        </Link>
        <div className="flex items-center space-x-6">
          {session ? (
            <>
              <Link 
                href="/mypage" 
                className="text-white hover:text-background transition-colors"
              >
                マイページ
              </Link>
              <Link 
                href="/checkout" 
                className="text-white hover:text-background transition-colors"
              >
                プラン変更
              </Link>
              <Button 
                onClick={handleSignOut} 
                variant="outline"
                className="border-2 bg-white text-primary border-primary hover:bg-primary hover:text-white hover:border-2 hover:border-white transition-all"
              >
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-white hover:text-background transition-colors"
              >
                ログイン
              </Link>
              <Link href="/register">
                <Button 
                  variant="default"
                  className="border-2 bg-white text-primary border-primary hover:bg-primary hover:text-white hover:border-2 hover:border-white transition-all"
                >
                  会員登録
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}


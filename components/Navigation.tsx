'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/app/utils/supabase'

export default function Navigation() {
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

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
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          条例DB
        </Link>
        <div>
          {session ? (
            <>
              <Link href="/ordinances" className="mr-4">
                条例一覧
              </Link>
              <Link href="/mypage" className="mr-4">
                マイページ
              </Link>
              <Link href="/checkout" className="mr-4">
                プラン変更
              </Link>
              <Button onClick={handleSignOut} variant="outline">
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-4">
                ログイン
              </Link>
              <Link href="/register" className="mr-4">
                会員登録
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}


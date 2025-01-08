'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/app/utils/supabase'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { type Profile } from '@/app/utils/supabase'

export default function MyPage() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { showSnackbar } = useSnackbar()

  // プロファイルを直接取得する関数
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('プロファイル取得エラー:', error)
      return null
    }
  }

  // セッション管理とプロファイル取得
  useEffect(() => {
    const initializeProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      setSession(session)
      const profileData = await fetchProfile(session.user.id)
      setProfile(profileData)

      // チェックアウト成功時のプラン更新処理
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get('checkout') === 'success') {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ plan: 'premium' })
            .eq('id', session.user.id)
            

          if (error) throw error
          showSnackbar('プランが正常に更新されました', 'success')
          // パラメータを削除してリロード
          router.push('/mypage')
        } catch (error) {
          console.error('プラン更新エラー:', error)
          showSnackbar('プランの更新に失敗しました', 'error')
        }
      }
    }

    initializeProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        router.push('/login')
        return
      }
      setSession(session)
      const profileData = await fetchProfile(session.user.id)
      setProfile(profileData)
    })

    return () => subscription.unsubscribe()
  }, [router])

  // リアルタイム更新のリスナー
  useEffect(() => {
    if (!session?.user?.id) return

    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        async (payload) => {
          console.log('Profile updated:', payload)
          setProfile(payload.new as Profile)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [session?.user?.id])

  // プラン変更処理
  const handleUpdatePlan = async () => {
    if (!session?.user?.id) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ plan: 'free' })
        .eq('id', session.user.id)
        .select()
        .single()

      if (error) throw error

      showSnackbar('無料プランに変更しました', 'success')
      // 更新成功後にページをリロード
      window.location.reload()
    } catch (error) {
      console.error('プラン更新エラー:', error)
      showSnackbar('プランの更新に失敗しました', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session || !profile) {
    return null
  }

  return (
    <main>
      <Navigation />
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">マイページ</h1>
        <p className="mb-4">メールアドレス: {session.user.email}</p>
        <p className="mb-4">ユーザー名: {profile.username || '未設定'}</p>
        <p className="mb-4">フルネーム: {profile.full_name || '未設定'}</p>
        <p className="mb-4">現在のプラン: {profile.plan === 'premium' ? '有料プラン（月額15,000円）' : '無料プラン'}</p>
        {profile.plan === 'premium' && (
          <Button 
            onClick={handleUpdatePlan}
            className="mb-4"
            disabled={isLoading}
          >
            無料プランに変更
          </Button>
        )}
        <div className="mt-4">
          <Link href="/reset-password" className="text-blue-600 hover:underline">
            パスワードを忘れた場合
          </Link>
        </div>
      </div>
    </main>
  )
}



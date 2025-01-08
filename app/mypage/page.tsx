'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { supabase, type Profile } from '@/app/utils/supabase'
import { getUserProfile, updateUserPlan } from '@/app/actions/profileActions'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function MyPage() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const router = useRouter()
  const { showSnackbar } = useSnackbar()

  // セッション管理
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // プロファイル取得
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchProfile = async () => {
      try {
        const userProfile = await getUserProfile(session.user.id)
        if (userProfile) {
          console.log('Fetched profile:', userProfile)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Profile fetch error:', error)
        showSnackbar('プロファイル情報の取得に失敗しました', 'error')
      }
    }

    fetchProfile()

    // 定期的な更新
    const interval = setInterval(fetchProfile, 2000)
    return () => clearInterval(interval)
  }, [session?.user?.id, showSnackbar])

  // URLのクエリパラメータを監視して、チェックアウト完了後の処理を行う
  useEffect(() => {
    const checkoutSuccess = new URLSearchParams(window.location.search).get('checkout') === 'success'
    if (checkoutSuccess && session?.user?.id) {
      const updateToPremium = async () => {
        try {
          const updatedProfile = await updateUserPlan(session.user.id, 'premium')
          console.log('Premium update result:', updatedProfile)
          
          if (updatedProfile) {
            setProfile(updatedProfile)
            showSnackbar('有料プランに変更しました', 'success')
            
            // 確実に最新のデータを取得
            const refreshedProfile = await getUserProfile(session.user.id)
            if (refreshedProfile) {
              setProfile(refreshedProfile)
            }
          }
          // クエリパラメータを削除
          window.history.replaceState({}, '', window.location.pathname)
        } catch (error) {
          console.error('Premium update error:', error)
          showSnackbar('プランの更新に失敗しました', 'error')
        }
      }
      updateToPremium()
    }
  }, [session?.user?.id, showSnackbar])

  const handleChangePlan = async () => {
    if (!session?.user?.id || !profile) return

    const newPlan = profile.plan === 'free' ? 'premium' : 'free'
    if (newPlan === 'premium') {
      showSnackbar('有料プランへの変更を開始します', 'info')
      router.push('/checkout')
    } else {
      setShowConfirmDialog(true)
    }
  }

  const handleConfirmDowngrade = async () => {
    if (!session?.user?.id) {
      showSnackbar('セッションが見つかりません', 'error')
      return
    }

    setShowConfirmDialog(false)

    try {
      const updatedProfile = await updateUserPlan(session.user.id, 'free')
      console.log('Plan update result:', updatedProfile)
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        showSnackbar('無料プランに変更しました', 'success')
        
        // 確実に最新のデータを取得
        const refreshedProfile = await getUserProfile(session.user.id)
        if (refreshedProfile) {
          setProfile(refreshedProfile)
        }
      }
    } catch (error) {
      console.error('Plan update error:', error)
      showSnackbar('プランの更新に失敗しました', 'error')
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
        <Button onClick={handleChangePlan} className="mb-4">
          {profile.plan === 'premium' ? '無料プランに変更' : '有料プランに変更'}
        </Button>
        <div className="mt-4">
          <Link href="/reset-password" className="text-blue-600 hover:underline">
            パスワードを忘れた場合
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmDowngrade}
        title="無料プランへの変更確認"
        description="無料プランに変更すると、有料プランの機能が使えなくなります。本当に変更しますか？"
        confirmText="変更する"
        cancelText="キャンセル"
      />
    </main>
  )
}



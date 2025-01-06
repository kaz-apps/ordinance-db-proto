'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { supabase, type Profile } from '@/app/utils/supabase'
import { getUserProfile, updateUserPlan } from '@/app/actions/profileActions'

export default function MyPage() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
        fetchUserProfile(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.push('/login')
      } else {
        fetchUserProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const fetchUserProfile = async (userId: string) => {
    try {
      const userProfile = await getUserProfile(userId)
      if (userProfile) {
        setProfile(userProfile)
      }
    } catch (error) {
      console.error('ユーザープロファイルの取得エラー:', error)
      setError('プロファイル情報の取得に失敗しました')
    }
  }

  const handleChangePlan = async () => {
    if (!session || !profile) return

    const newPlan = profile.plan === 'free' ? 'premium' : 'free'
    try {
      const updatedProfile = await updateUserPlan(session.user.id, newPlan)
      if (updatedProfile) {
        setProfile(updatedProfile)
        setError(null)
        if (updatedProfile.plan === 'premium') {
          router.push('/checkout')
        }
      } else {
        throw new Error('プランの更新に失敗しました')
      }
    } catch (error) {
      console.error('プランの更新エラー:', error)
      setError(error instanceof Error ? error.message : 'プランの更新に失敗しました')
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
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mt-4">
          <Link href="/reset-password" className="text-blue-600 hover:underline">
            パスワードを忘れた場合
          </Link>
        </div>
      </div>
    </main>
  )
}


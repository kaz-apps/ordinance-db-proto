'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/app/utils/supabase'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { type Profile } from '@/lib/types'
import { updateProfile } from '@/app/actions/profileActions'

export default function MyPage() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    departmentName: '',
    lastName: '',
    firstName: '',
    phoneNumber: '',
  })
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
      
      // フォームデータを更新
      if (data) {
        const names = (data.full_name || '').split(' ')
        setFormData({
          companyName: data.company_name || '',
          departmentName: data.department_name || '',
          lastName: names[0] || '',
          firstName: names[1] || '',
          phoneNumber: data.phone_number || '',
        })
      }
      
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return
    
    setIsLoading(true)
    try {
      const result = await updateProfile(session.user.id, formData)
      if (result.success) {
        showSnackbar('プロフィールを更新しました', 'success')
        setIsEditing(false)
        // プロフィールを再取得
        const updatedProfile = await fetchProfile(session.user.id)
        setProfile(updatedProfile)
      } else {
        throw result.error
      }
    } catch (error) {
      console.error('更新エラー:', error)
      showSnackbar('プロフィールの更新に失敗しました', 'error')
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">マイページ</h1>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
          >
            {isEditing ? 'キャンセル' : 'プロフィールを編集'}
          </Button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会社名
              </label>
              <Input
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="会社名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部署名
              </label>
              <Input
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="部署名"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="姓"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="名"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="電話番号"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '更新中...' : '更新する'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p>メールアドレス: {session.user.email}</p>
            <p>会社名: {profile.company_name || '未設定'}</p>
            <p>部署名: {profile.department || '未設定'}</p>
            <p>氏名: {profile.full_name || '未設定'}</p>
            <p>電話番号: {profile.phone_number || '未設定'}</p>
            <p>現在のプラン: {profile.plan === 'premium' ? '有料プラン（月額15,000円）' : '無料プラン'}</p>
            {profile.plan === 'premium' ? (
              <Button 
                onClick={handleUpdatePlan}
                disabled={isLoading}
              >
                無料プランに変更
              </Button>
            ) : (
              <Link href="/checkout">
                <Button>
                  有料プランに変更
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}



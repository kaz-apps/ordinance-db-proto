'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { supabase } from '@/app/utils/supabase'
import { useSnackbar } from '@/contexts/SnackbarContext'

function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    const token = searchParams.get('token')
    const type = searchParams.get('type')

    if (token && type === 'recovery') {
      supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      }).then(({ error }) => {
        if (error) {
          console.error('Error verifying token:', error)
          showSnackbar('無効なトークンです。パスワードリセットを再度お試しください。', 'error')
        }
      })
    } else {
      showSnackbar('無効なリンクです。パスワードリセットを再度お試しください。', 'error')
    }
  }, [searchParams, showSnackbar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      showSnackbar('パスワードは6文字以上で入力してください。', 'error')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        showSnackbar('パスワードの更新に失敗しました。', 'error')
        console.error('Password update error:', error)
      } else {
        showSnackbar('パスワードが正常に更新されました。ログインページに移動します。', 'success')
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch (error) {
      showSnackbar('予期せぬエラーが発生しました。', 'error')
      console.error('Password update error:', error)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>新しいパスワードの設定</CardTitle>
        <CardDescription>新しいパスワードを入力してください。</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                新しいパスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                パスワードは6文字以上で入力してください
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">パスワードを更新</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function UpdatePassword() {
  return (
    <main>
      <Navigation />
      <div className="container mx-auto mt-8 px-4">
        <Suspense fallback={
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>読み込み中...</CardTitle>
              <CardDescription>しばらくお待ちください。</CardDescription>
            </CardHeader>
          </Card>
        }>
          <UpdatePasswordForm />
        </Suspense>
      </div>
    </main>
  )
}


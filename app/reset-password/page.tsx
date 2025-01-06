'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { supabase } from '@/app/utils/supabase'
import { useSnackbar } from '@/contexts/SnackbarContext'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const { showSnackbar } = useSnackbar()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      })

      if (error) {
        showSnackbar('パスワードリセットメールの送信に失敗しました。', 'error')
        console.error('Password reset error:', error)
      } else {
        showSnackbar('パスワードリセットメールを送信しました。メールをご確認ください。', 'success')
      }
    } catch (error) {
      showSnackbar('予期せぬエラーが発生しました。', 'error')
      console.error('Password reset error:', error)
    }
  }

  return (
    <main>
      <Navigation />
      <div className="container mx-auto mt-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>パスワードリセット</CardTitle>
            <CardDescription>登録したメールアドレスを入力してください。</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    メールアドレス
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">パスワードリセットメールを送信</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}


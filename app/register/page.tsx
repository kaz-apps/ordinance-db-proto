'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/app/utils/supabase'
import { useSnackbar } from '@/contexts/SnackbarContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const router = useRouter()
  const { showSnackbar } = useSnackbar()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termsAccepted || !privacyAccepted) {
      showSnackbar('利用規約とプライバシーポリシーに同意する必要があります。', 'error')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      showSnackbar(error.message, 'error')
    } else {
      showSnackbar('確認メールを送信しました。メールをご確認ください。', 'success')
    }
  }

  return (
    <main>
      <Navigation />
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">会員登録</h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2">メールアドレス</label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2">パスワード</label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label htmlFor="terms">
                <Link href="/terms" className="text-blue-600 hover:underline">利用規約</Link>に同意します
              </label>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="privacy" 
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
              />
              <label htmlFor="privacy">
                <Link href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>に同意します
              </label>
            </div>
          </div>
          <Button type="submit">登録</Button>
        </form>
      </div>
    </main>
  )
}


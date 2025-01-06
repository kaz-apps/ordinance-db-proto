'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useSnackbar } from '@/contexts/SnackbarContext'

export default function Checkout() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showSnackbar } = useSnackbar()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    showSnackbar('決済処理を開始します...', 'info')

    try {
      // Here you would typically call your Stripe payment processing function
      // For this dummy implementation, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      showSnackbar('有料プランへの変更が完了しました', 'success')
      router.push('/mypage')
    } catch (error) {
      showSnackbar('決済処理に失敗しました。もう一度お試しください。', 'error')
      console.error('Payment error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <Navigation />
      <div className="container mx-auto mt-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>有料プランへのアップグレード</CardTitle>
            <CardDescription>月額15,000円の有料プランにアップグレードします。</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                    カード番号
                  </label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" required />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                      有効期限
                    </label>
                    <Input id="expiry" placeholder="MM / YY" required />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                      CVC
                    </label>
                    <Input id="cvc" placeholder="123" required />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '処理中...' : '支払いを完了する'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}


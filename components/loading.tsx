import Navigation from '../components/Navigation'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Loading() {
  return (
    <main>
      <Navigation />
      <div className="container mx-auto mt-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>読み込み中...</CardTitle>
            <CardDescription>しばらくお待ちください。</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  )
}


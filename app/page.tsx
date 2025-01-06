import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-foreground">
            建築設計条例データベースへようこそ
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            このアプリケーションでは、建築設計に関する条例を簡単に閲覧・管理することができます。
          </p>
          
          {/* カードセクションの追加 */}
          <div className="grid gap-6 mt-8">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                主な機能
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>• 条例の検索と閲覧</li>
                <li>• お気に入り条例の保存</li>
                <li>• 条例の更新通知</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}


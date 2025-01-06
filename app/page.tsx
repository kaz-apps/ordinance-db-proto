import Navigation from '../components/Navigation'

export default function Home() {
  return (
    <main>
      <Navigation />
      <div className="container mx-auto mt-8 px-4">
        <h1 className="text-4xl font-bold mb-4">建築設計条例データベースへようこそ</h1>
        <p className="text-xl">
          このアプリケーションでは、建築設計に関する条例を簡単に閲覧・管理することができます。
        </p>
      </div>
    </main>
  )
}


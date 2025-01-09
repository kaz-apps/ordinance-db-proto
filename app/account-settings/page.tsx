'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { deleteAccount } from '@/app/actions/profileActions'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AccountSettings() {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteAccount()
      if (result.success) {
        toast({
          title: 'アカウントを削除しました',
          description: 'ご利用ありがとうございました。',
        })
        router.push('/login')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'アカウントの削除に失敗しました。',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="mx-auto">
      <Navigation />

      <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-8 p-6">アカウント設定</h1>
        {/* アカウント削除セクション */}
        <div className="bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">アカウント削除</h2>
        <p className="text-gray-600 mb-4">
            アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。
        </p>
        <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
        >
            アカウントを削除する
        </Button>
        </div>

        {/* 削除確認モーダル */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>アカウント削除</DialogTitle>
            <DialogDescription>
                <p className="mb-4">
                現在ご利用中のプレミアムプランは、契約期間の終了日（YYYY年MM月DD日）まで引き続きご利用いただけます。
                </p>
                <p className="mb-4">
                アカウントを削除された場合、以下の点にご注意ください。
                </p>
                <ul className="list-disc pl-6 mb-4">
                <li>サービスのご利用および関連データへのアクセスができなくなります。</li>
                <li>返金や払い戻しの対象外となります。</li>
                <li>自動更新の停止は次回の更新時に反映されます。</li>
                </ul>
                <p className="font-semibold">本当にアカウントを削除しますか？</p>
            </DialogDescription>
            </DialogHeader>
            <DialogFooter>
            <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
            >
                キャンセル
            </Button>
            <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
            >
                {isDeleting ? '削除中...' : '削除する'}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
      </div>
      
    </div>
  )
} 
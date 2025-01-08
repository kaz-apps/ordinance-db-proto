import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserProfile, updateUserPlan } from '@/app/actions/profileActions'
import { type Profile } from '@/app/utils/supabase'

// プロファイル取得のクエリキー
const PROFILE_QUERY_KEY = 'profile'

export function useProfile(userId: string | undefined) {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: () => getUserProfile(userId as string),
    enabled: !!userId,
    staleTime: 0, // 常に最新データを取得
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, plan }: { userId: string; plan: 'free' | 'premium' }) => {
      const result = await updateUserPlan(userId, plan)
      if (!result) {
        throw new Error('プランの更新に失敗しました')
      }
      return { result, userId, plan }
    },
    onMutate: async ({ userId, plan }) => {
      // 楽観的更新のための準備
      await queryClient.cancelQueries({ queryKey: [PROFILE_QUERY_KEY, userId] })
      const previousProfile = queryClient.getQueryData([PROFILE_QUERY_KEY, userId])

      // キャッシュを楽観的に更新
      queryClient.setQueryData([PROFILE_QUERY_KEY, userId], (old: any) => ({
        ...old,
        plan,
      }))

      return { previousProfile }
    },
    onError: (err, { userId }, context: any) => {
      // エラー時は前の状態に戻す
      if (context?.previousProfile) {
        queryClient.setQueryData([PROFILE_QUERY_KEY, userId], context.previousProfile)
      }
    },
    onSettled: async (data) => {
      if (data) {
        // 必ず最新のデータを再取得
        await queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, data.userId] })
        await queryClient.refetchQueries({ queryKey: [PROFILE_QUERY_KEY, data.userId] })
      }
    },
  })
} 
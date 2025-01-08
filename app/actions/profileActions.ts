'use server'

import { createClient } from '@supabase/supabase-js'
import { type Profile } from '@/app/utils/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URLが設定されていません')
}

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEYが設定されていません')
}

// サーバーサイドでのSupabaseクライアント
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
})

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('ユーザープロファイルの取得エラー:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('ユーザープロファイル取得中の予期せぬエラー:', error)
    return null
  }
}

export async function updateUserPlan(userId: string, plan: 'free' | 'premium'): Promise<Profile | null> {
  try {
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません')
    }

    // まず更新を実行
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ plan })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    // 更新の確認を最大5回試行
    let retryCount = 0
    const maxRetries = 5
    const retryDelay = 1000 // 1秒待機

    while (retryCount < maxRetries) {
      // 待機してから確認
      await new Promise(resolve => setTimeout(resolve, retryDelay))

      const { data: verifyProfile, error: verifyError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (verifyError) {
        retryCount++
        continue
      }

      if (!verifyProfile) {
        retryCount++
        continue
      }

      if (verifyProfile.plan === plan) {
        return verifyProfile
      }

      retryCount++
    }

    throw new Error(`プランの更新が${maxRetries}回の試行後も反映されませんでした（期待値: ${plan}）`)
  } catch (error) {
    console.error('Plan update error:', error)
    throw error
  }
}


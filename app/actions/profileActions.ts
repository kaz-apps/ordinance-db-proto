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

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('ユーザープランの更新エラー:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('ユーザープラン更新中の予期せぬエラー:', error)
    return null
  }
}


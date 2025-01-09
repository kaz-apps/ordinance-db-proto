'use server'

import { createClient } from '@supabase/supabase-js'
import { type Profile } from '@/lib/types'
import { supabase } from '@/app/utils/supabase'

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

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabaseの設定が不正です')
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
    const retryDelay = 2000 // 2秒待機

    while (retryCount < maxRetries) {
      // 待機してから確認
      await new Promise(resolve => setTimeout(resolve, retryDelay))

      // キャッシュを使用しない新しいクライアントで確認
      const freshClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        },
        db: {
          schema: 'public'
        }
      })

      const { data: verifyProfile, error: verifyError } = await freshClient
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

    // 更新は行われているが確認できない場合は、最新のプロファイルを返す
    const { data: finalProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (finalProfile) {
      return finalProfile
    }

    throw new Error(`プランの更新が${maxRetries}回の試行後も反映されませんでした（期待値: ${plan}）`)
  } catch (error) {
    console.error('Plan update error:', error)
    throw error
  }
}

export async function updateProfile(userId: string, data: {
  companyName?: string;
  departmentName?: string;
  lastName?: string;
  firstName?: string;
  phoneNumber?: string;
}) {
  try {
    const fullName = `${data.lastName || ''} ${data.firstName || ''}`.trim();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        company_name: data.companyName,
        department: data.departmentName,
        full_name: fullName || null,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
      })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return { success: false, error };
  }
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    // ユーザー情報を取得
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError || !user) {
      return { success: false, error: 'ユーザーが見つかりません' }
    }

    // パスワードの更新
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('パスワード更新エラー:', error)
    return { success: false, error: '予期せぬエラーが発生しました' }
  }
}

export async function deleteAccount() {
  try {
    const response = await fetch("/api/delete-account", {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete account");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { error: "アカウントの削除に失敗しました" };
  }
}


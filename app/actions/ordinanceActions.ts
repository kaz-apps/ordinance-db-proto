'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/app/utils/supabase'
import { Profile } from '@/lib/types'

export async function getOrdinances() {
  try {
    const { data, error } = await supabase
      .from('ordinances')
      .select('*')
      .order('id')

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('条例データの取得に失敗しました')
    }

    return data || []
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

export async function getUserProfile(): Promise<Profile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.log('No active session found')
      return null
    }

    console.log('Session user details:', {
      id: session.user.id,
      email: session.user.email,
      metadata: session.user.user_metadata
    })

    // まずemailでプロファイルを検索
    const { data: emailData, error: emailError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', session.user.email)
      .single()

    if (!emailError && emailData) {
      console.log('Found profile by email:', emailData)
      return emailData
    }

    // IDでプロファイルを検索
    const { data: idData, error: idError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!idError && idData) {
      console.log('Found profile by ID:', idData)
      return idData
    }

    // プロファイルが見つからない場合は新規作成
    console.log('Creating new profile for user')
    const newProfile = {
      id: session.user.id,
      username: session.user.email,
      created_at: new Date().toISOString(),
      full_name: session.user.user_metadata.full_name || null,
      password: null,
      plan: 'free' as const
    }

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
      return null
    }

    console.log('Successfully created new profile:', createdProfile)
    return createdProfile
  } catch (error) {
    console.error('Error fetching/creating user profile:', error)
    return null
  }
}

export async function addOrdinance(ordinance: any) {
  const { data, error } = await supabase
    .from('ordinances')
    .insert([ordinance])
    .select()

  if (error) {
    throw new Error('条例の追加に失敗しました')
  }

  revalidatePath('/ordinances')
  return data
}


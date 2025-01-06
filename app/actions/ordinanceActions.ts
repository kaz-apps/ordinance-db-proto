'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/app/utils/supabase'

export async function getOrdinances() {
  const { data, error } = await supabase
    .from('ordinances')
    .select('*')
    .order('id')

  if (error) {
    throw new Error('条例データの取得に失敗しました')
  }

  return data
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


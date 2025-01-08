'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import OrdinanceTable from '@/components/OrdinanceTable'
import { Ordinance, UserPlan } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { getOrdinances, getUserProfile } from '@/app/actions/ordinanceActions'
import { supabase } from '@/app/utils/supabase'

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-'
  try {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString()
    }
    return date.toLocaleDateString()
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

export default function Home() {
  const [ordinances, setOrdinances] = useState<Ordinance[]>([])
  const [filteredOrdinances, setFilteredOrdinances] = useState<Ordinance[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [userPlan, setUserPlan] = useState<UserPlan>('unregistered')

  useEffect(() => {
    fetchOrdinances()
    fetchUserProfile()

    // Supabaseの認証状態変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session)
      fetchUserProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    filterOrdinances()
  }, [ordinances, selectedDepartment, selectedCategory, searchTerm])

  async function fetchOrdinances() {
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 15000)

    try {
      console.log('Fetching ordinances...')
      const rawData = await getOrdinances() as any[]
      clearTimeout(timeoutId)

      console.log('Fetched ordinances:', rawData)
      if (!rawData || rawData.length === 0) {
        console.warn('No ordinances data received')
        setOrdinances([])
        setDepartments([])
        setCategories([])
        return
      }

      // データを正しい形式に変換
      const formattedData = rawData.map(item => ({
        id: item.id,
        municipalityName: `${item.prefecture} ${item.city}`,
        title: item.name || '',
        firstLine: item.content || '',
        surveyGroup: item.department || '',
        content: item.content || '',
        department: item.department || '',
        category: item.category || '',
        createdAt: item.created_at ? new Date(item.created_at) : null,
        updatedAt: item.updated_at ? new Date(item.updated_at) : null
      }))

      setOrdinances(formattedData)
      const uniqueDepartments = [...new Set(rawData.map(item => item.department))]
      const uniqueCategories = [...new Set(rawData.map(item => item.category))]
      setDepartments(uniqueDepartments)
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching ordinances:', error)
      setOrdinances([])
      setDepartments([])
      setCategories([])
    } finally {
      clearTimeout(timeoutId)
    }
  }

  function filterOrdinances() {
    let filtered = ordinances

    if (selectedDepartment && selectedDepartment !== 'all') {
      filtered = filtered.filter(ord => ord.department === selectedDepartment)
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(ord => ord.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(ord => 
        ord.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.municipalityName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredOrdinances(filtered)
  }

  const exportCSV = () => {
    const headers = ['ID', '自治体名', 'タイトル', '調査グループ', '更新日']
    const csvContent = [
      headers.join(','),
      ...filteredOrdinances.map(ord => [
        ord.id,
        ord.municipalityName,
        ord.title,
        ord.surveyGroup,
        formatDate(ord.updatedAt)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'ordinances.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  async function fetchUserProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session:', session)
      
      if (!session) {
        console.log('No session found, setting plan to unregistered')
        setUserPlan('unregistered')
        return
      }

      // プロファイルをemailで検索
      const { data: emailData, error: emailError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', session.user.email)
        .single()

      if (!emailError && emailData) {
        console.log('Found profile by email:', emailData)
        setUserPlan(emailData.plan)
        return
      }

      // プロファイルをIDで検索
      const { data: idData, error: idError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!idError && idData) {
        console.log('Found profile by ID:', idData)
        setUserPlan(idData.plan)
        return
      }

      // プロファイルが見つからない場合は新規作成
      console.log('Creating new profile for user:', session.user.email)
      const newProfile = {
        id: session.user.id,
        username: session.user.email,
        created_at: new Date().toISOString(),
        full_name: session.user.user_metadata?.full_name || null,
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
        setUserPlan('unregistered')
        return
      }

      console.log('Successfully created new profile:', createdProfile)
      setUserPlan(createdProfile.plan)
    } catch (error) {
      console.error('Error fetching/creating user profile:', error)
      setUserPlan('unregistered')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-foreground">
            建築設計条例データベースへようこそ
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            このアプリケーションでは、建築設計に関する条例を簡単に閲覧・管理することができます。
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Select onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="協議先区分" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="search"
              placeholder="条例名、自治体名で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[300px]"
            />
            <Button onClick={exportCSV} className="whitespace-nowrap">CSVエクスポート</Button>
          </div>

          <div className="mt-8">
            <OrdinanceTable 
              ordinances={filteredOrdinances.length > 0 ? filteredOrdinances : ordinances} 
              userPlan={userPlan} 
            />
          </div>
        </div>
      </div>
    </main>
  )
}


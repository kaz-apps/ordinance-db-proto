'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getOrdinances } from '@/app/actions/ordinanceActions'

interface Ordinance {
  id: number
  prefecture: string
  city: string
  department: string
  category: string
  name: string
  reference_url: string | null
  additional_reference_url: string | null
}

export default function Ordinances() {
  const [ordinances, setOrdinances] = useState<Ordinance[]>([])
  const [filteredOrdinances, setFilteredOrdinances] = useState<Ordinance[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    fetchOrdinances()
  }, [])

  useEffect(() => {
    filterOrdinances()
  }, [ordinances, selectedDepartment, selectedCategory, searchTerm])

  async function fetchOrdinances() {
    try {
      const data = await getOrdinances()
      setOrdinances(data)
      const uniqueDepartments = [...new Set(data.map((ord: Ordinance) => ord.department))]
      const uniqueCategories = [...new Set(data.map((ord: Ordinance) => ord.category))]
      setDepartments(uniqueDepartments)
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching ordinances:', error)
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
        ord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.prefecture.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredOrdinances(filtered)
  }

  const exportCSV = () => {
    const headers = ['ID', '都道府県', '市区町村', '協議先区分', 'カテゴリ', '法規制/条例名称', '参照元 URL', '追加の参照元 URL']
    const csvContent = [
      headers.join(','),
      ...filteredOrdinances.map(ord => [
        ord.id,
        ord.prefecture,
        ord.city,
        ord.department,
        ord.category,
        ord.name,
        ord.reference_url || '',
        ord.additional_reference_url || ''
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

  return (
    <main>
      <Navigation />
      <div className="container mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold mb-4">条例一覧</h1>
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
            placeholder="条例名、都道府県、市区町村で検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>
        <Button onClick={exportCSV} className="mb-4">CSVエクスポート</Button>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">ID</th>
                <th className="px-4 py-2 border-b">都道府県</th>
                <th className="px-4 py-2 border-b">市区町村</th>
                <th className="px-4 py-2 border-b">協議先区分</th>
                <th className="px-4 py-2 border-b">カテゴリ</th>
                <th className="px-4 py-2 border-b">法規制/条例名称</th>
                <th className="px-4 py-2 border-b">参照元 URL</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrdinances.map((ord) => (
                <tr key={ord.id}>
                  <td className="px-4 py-2 border-b">{ord.id}</td>
                  <td className="px-4 py-2 border-b">{ord.prefecture}</td>
                  <td className="px-4 py-2 border-b">{ord.city}</td>
                  <td className="px-4 py-2 border-b">{ord.department}</td>
                  <td className="px-4 py-2 border-b">{ord.category}</td>
                  <td className="px-4 py-2 border-b">{ord.name}</td>
                  <td className="px-4 py-2 border-b">
                    {ord.reference_url && (
                      <a href={ord.reference_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        リンク
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}


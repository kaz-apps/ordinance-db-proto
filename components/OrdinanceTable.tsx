import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ordinance, OrdinanceTableProps, UserPlan } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const getVisibleContent = (ordinance: Ordinance, userPlan: UserPlan, department: string) => {
  switch (userPlan) {
    case 'premium':
      return ordinance.content
    case 'free':
      return department === '調査' ? ordinance.content : ordinance.surveyGroup
    case 'unregistered':
      return ordinance.firstLine
    default:
      return ordinance.firstLine
  }
}

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

const getBlurLevel = (userPlan: UserPlan) => {
  switch (userPlan) {
    case 'premium':
      return ''
    case 'free':
      return 'blur-[2px]'
    case 'unregistered':
      return 'blur-[3px]'
    default:
      return 'blur-[3px]'
  }
}

const getPlanMessage = (userPlan: UserPlan) => {
  switch (userPlan) {
    case 'premium':
      return null
    case 'free':
      return '🔒 プレミアムプランにアップグレードすると、すべての条例内容を閲覧できます'
    case 'unregistered':
      return '🔒 無料登録頂くとカテゴリ「調査」のみご覧いただけます。有料プランに移行頂くと全ての条例が閲覧可能です。'
    default:
      return '🔒 無料登録頂くとカテゴリ「調査」のみご覧いただけます。有料プランに移行頂くと全ての条例が閲覧可能です。'
  }
}

export default function OrdinanceTable({ ordinances, userPlan }: OrdinanceTableProps) {
  const blurClass = getBlurLevel(userPlan)
  const planMessage = getPlanMessage(userPlan)

  // 部門ごとにグループ化
  const groupedOrdinances = ordinances.reduce((acc, ordinance) => {
    const dept = ordinance.department || '未分類'
    if (!acc[dept]) {
      acc[dept] = []
    }
    acc[dept].push(ordinance)
    return acc
  }, {} as Record<string, Ordinance[]>)

  // 各自治体の最初の条例を記録
  const firstOrdinanceByMunicipality = new Set<string>()
  if (userPlan === 'unregistered') {
    ordinances.forEach(ord => {
      if (!firstOrdinanceByMunicipality.has(ord.municipalityName)) {
        firstOrdinanceByMunicipality.add(ord.municipalityName)
      }
    })
  }

  // 条例が自治体の最初の1件かどうかをチェック
  const isFirstOrdinance = (ordinance: Ordinance) => {
    if (userPlan !== 'unregistered') return false
    const municipalityOrdinances = ordinances.filter(
      ord => ord.municipalityName === ordinance.municipalityName
    )
    return municipalityOrdinances[0]?.id === ordinance.id
  }

  // 表示制御の判定
  const shouldShowContent = (ordinance: Ordinance, department: string) => {
    switch (userPlan) {
      case 'premium':
        return true
      case 'free':
        return department === '調査'
      case 'unregistered':
        return isFirstOrdinance(ordinance)
      default:
        return false
    }
  }

  return (
    <div className="w-full">
      {planMessage && (
        <div className="mb-4 p-4 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">
            {planMessage}
            {userPlan === 'unregistered' && (
              <Link href="/register" className="ml-2">
                <Button variant="link" className="text-primary">
                  登録する
                </Button>
              </Link>
            )}
          </p>
        </div>
      )}
      <div className={`relative ${userPlan !== 'premium' ? 'group' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">自治体名</TableHead>
              <TableHead className="w-[300px]">タイトル</TableHead>
              <TableHead>内容</TableHead>
              <TableHead className="w-[120px]">更新日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedOrdinances).map(([department, deptOrdinances]) => (
              <React.Fragment key={department}>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="bg-gray-700 text-white font-medium py-2"
                  >
                    {department}
                  </TableCell>
                </TableRow>
                {deptOrdinances.map((ordinance) => {
                  const shouldShow = shouldShowContent(ordinance, department)
                  const shouldBlur = !shouldShow
                  return (
                    <TableRow 
                      key={ordinance.id} 
                      className={`
                        ${shouldBlur ? 'blur-[3px]' : ''}
                        border-b border-gray-200
                      `}
                    >
                      <TableCell className="py-3">{ordinance.municipalityName}</TableCell>
                      <TableCell className="py-3">{ordinance.title}</TableCell>
                      <TableCell className="py-3">
                        {getVisibleContent(ordinance, userPlan, department)}
                      </TableCell>
                      <TableCell className="py-3">{formatDate(ordinance.updatedAt)}</TableCell>
                    </TableRow>
                  )
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
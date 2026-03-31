import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { Transaction } from "@/types"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types"

interface ChartsProps {
  transactions: Transaction[]
}

const RADIAN = Math.PI / 180
function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name,
}: {cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name: string}) {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {name.length > 4 ? name.slice(0, 4) : name}
    </text>
  )
}

export function Charts({ transactions }: ChartsProps) {
  // 支出分类汇总
  const expenseCategoryMap: Record<string, number> = {}
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseCategoryMap[t.category] = (expenseCategoryMap[t.category] || 0) + t.amount
    })
  const expensePieData = Object.entries(expenseCategoryMap).map(([name, value]) => ({
    name,
    value,
    color:
      EXPENSE_CATEGORIES.find((c) => c.name === name)?.color || "#94a3b8",
  }))

  // 收入分类汇总
  const incomeCategoryMap: Record<string, number> = {}
  transactions
    .filter((t) => t.type === "income")
    .forEach((t) => {
      incomeCategoryMap[t.category] = (incomeCategoryMap[t.category] || 0) + t.amount
    })
  const incomePieData = Object.entries(incomeCategoryMap).map(([name, value]) => ({
    name,
    value,
    color:
      INCOME_CATEGORIES.find((c) => c.name === name)?.color || "#22c55e",
  }))

  // 按月收支趋势（最近6个月）
  const monthMap: Record<string, { month: string; income: number; expense: number }> = {}
  transactions.forEach((t) => {
    const month = t.date.slice(0, 7)
    if (!monthMap[month]) monthMap[month] = { month, income: 0, expense: 0 }
    if (t.type === "income") monthMap[month].income += t.amount
    else monthMap[month].expense += t.amount
  })
  const barData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((d) => ({
      ...d,
      month: d.month.replace("-", "/"),
    }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 支出分布 */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-gray-700">支出分布</CardTitle>
        </CardHeader>
        <CardContent>
          {expensePieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">暂无支出数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, "金额"]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 收入分布 */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-gray-700">收入来源</CardTitle>
        </CardHeader>
        <CardContent>
          {incomePieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">暂无收入数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={incomePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {incomePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, "金额"]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 收支趋势 */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-gray-700">收支趋势</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="income" name="收入" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="支出" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

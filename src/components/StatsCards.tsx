import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  totalIncome: number
  totalExpense: number
  netProfit: number
  count: number
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function StatsCards({ totalIncome, totalExpense, netProfit, count }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 总收入 */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
              收入
            </span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            ¥{formatAmount(totalIncome)}
          </div>
          <div className="text-xs text-green-600 mt-1">本期总收入</div>
        </CardContent>
      </Card>

      {/* 总支出 */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-rose-50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-0.5 rounded-full">
              支出
            </span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            ¥{formatAmount(totalExpense)}
          </div>
          <div className="text-xs text-red-500 mt-1">本期总支出</div>
        </CardContent>
      </Card>

      {/* 净利润 */}
      <Card
        className={`border-0 shadow-md bg-gradient-to-br ${
          netProfit >= 0
            ? "from-blue-50 to-indigo-50"
            : "from-orange-50 to-amber-50"
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`p-2 rounded-lg ${
                netProfit >= 0 ? "bg-blue-100" : "bg-orange-100"
              }`}
            >
              <DollarSign
                className={`h-5 w-5 ${
                  netProfit >= 0 ? "text-blue-600" : "text-orange-500"
                }`}
              />
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                netProfit >= 0
                  ? "text-blue-600 bg-blue-100"
                  : "text-orange-600 bg-orange-100"
              }`}
            >
              {netProfit >= 0 ? "盈利" : "亏损"}
            </span>
          </div>
          <div
            className={`text-2xl font-bold ${
              netProfit >= 0 ? "text-blue-700" : "text-orange-600"
            }`}
          >
            {netProfit >= 0 ? "+" : ""}¥{formatAmount(netProfit)}
          </div>
          <div
            className={`text-xs mt-1 ${
              netProfit >= 0 ? "text-blue-500" : "text-orange-500"
            }`}
          >
            净利润
          </div>
        </CardContent>
      </Card>

      {/* 账目数 */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-violet-50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-0.5 rounded-full">
              账目
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-700">{count}</div>
          <div className="text-xs text-purple-500 mt-1">总账目条数</div>
        </CardContent>
      </Card>
    </div>
  )
}

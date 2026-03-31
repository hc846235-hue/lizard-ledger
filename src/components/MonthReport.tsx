import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts"
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Zap, AlertCircle } from "lucide-react"
import type { Transaction } from "@/types"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types"
import { useReports } from "@/hooks/useReports"

interface MonthReportProps {
  transactions: Transaction[]
}

const tooltipStyle = {
  contentStyle: { fontSize: 12, borderRadius: 10, border: "1px solid #f0f0f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
}

// 日历热力图
function DailyHeatmap({ dailyData, year, month }: {
  dailyData: { day: number; income: number; expense: number; profit: number; hasActivity: boolean }[]
  year: string
  month: string
}) {
  const firstDayOfWeek = new Date(Number(year), Number(month) - 1, 1).getDay() // 0=日
  const weekLabels = ["日", "一", "二", "三", "四", "五", "六"]
  const maxAmount = Math.max(...dailyData.map((d) => d.income + d.expense), 1)
  const [hovered, setHovered] = useState<number | null>(null)

  // 填充前置空格
  const cells: (typeof dailyData[0] | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...dailyData,
  ]
  // 补全到7的倍数
  while (cells.length % 7 !== 0) cells.push(null)

  const getColor = (cell: typeof dailyData[0]) => {
    if (!cell.hasActivity) return "bg-gray-100"
    const intensity = (cell.income + cell.expense) / maxAmount
    if (cell.profit > 0) {
      if (intensity > 0.7) return "bg-green-500"
      if (intensity > 0.4) return "bg-green-400"
      return "bg-green-300"
    } else if (cell.profit < 0) {
      if (intensity > 0.7) return "bg-red-500"
      if (intensity > 0.4) return "bg-red-400"
      return "bg-red-300"
    }
    return "bg-blue-300"
  }

  return (
    <div className="space-y-2">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekLabels.map((w) => (
          <div key={w} className="text-center text-[10px] text-gray-400 font-medium">{w}</div>
        ))}
      </div>
      {/* 日历格 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => (
          <div key={i} className="relative aspect-square">
            {cell ? (
              <div
                className={`w-full h-full rounded-lg ${getColor(cell)} flex items-center justify-center cursor-default transition-transform hover:scale-110`}
                onMouseEnter={() => setHovered(cell.day)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className={`text-[10px] font-medium ${cell.hasActivity ? "text-white" : "text-gray-400"}`}>
                  {cell.day}
                </span>
                {/* 悬停提示 */}
                {hovered === cell.day && cell.hasActivity && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap shadow-lg pointer-events-none">
                    <div className="font-medium mb-0.5">{month}/{cell.day}</div>
                    {cell.income > 0 && <div className="text-green-400">收 ¥{new Intl.NumberFormat("zh-CN").format(cell.income)}</div>}
                    {cell.expense > 0 && <div className="text-red-400">支 ¥{new Intl.NumberFormat("zh-CN").format(cell.expense)}</div>}
                    <div className={cell.profit >= 0 ? "text-blue-300" : "text-orange-400"}>
                      利 ¥{new Intl.NumberFormat("zh-CN").format(cell.profit)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>
      {/* 图例 */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block" />盈利日</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" />亏损日</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-300 inline-block" />收支相抵</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block" />无记录</span>
        <span className="ml-auto">颜色深浅代表金额大小</span>
      </div>
    </div>
  )
}

// 分类明细手风琴
function CategoryDetail({
  name, total, grandTotal, subs, color, type,
}: {
  name: string
  total: number
  grandTotal: number
  subs: Record<string, number>
  color: string
  type: "income" | "expense"
}) {
  const [open, setOpen] = useState(false)
  const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium text-gray-700 truncate">{name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
          <span className="text-xs text-gray-400 w-8 text-right">{pct.toFixed(0)}%</span>
          <span className={`text-sm font-bold ${type === "income" ? "text-green-600" : "text-red-500"}`}>
            ¥{new Intl.NumberFormat("zh-CN").format(total)}
          </span>
          <span className={`text-gray-300 text-xs transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50 divide-y divide-gray-100">
          {Object.entries(subs)
            .sort((a, b) => b[1] - a[1])
            .map(([sub, val]) => (
              <div key={sub} className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-gray-500">{sub}</span>
                <span className="text-xs font-medium text-gray-700">
                  ¥{new Intl.NumberFormat("zh-CN").format(val)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export function MonthReport({ transactions }: MonthReportProps) {
  const { availableMonths, getMonthReport, fmt } = useReports(transactions)
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const defaultMonth = availableMonths[0] || currentMonth
  const [month, setMonth] = useState(defaultMonth)

  const data = getMonthReport(month)
  const monthIdx = availableMonths.indexOf(month)
  const [year, mon] = month.split("-")

  const incomeTrend = data.prevIncome > 0 ? ((data.totalIncome - data.prevIncome) / data.prevIncome) * 100 : 0
  const expenseTrend = data.prevExpense > 0 ? ((data.totalExpense - data.prevExpense) / data.prevExpense) * 100 : 0

  return (
    <div className="space-y-6">
      {/* 月份选择器 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">月度报表</h2>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
          <button
            onClick={() => monthIdx < availableMonths.length - 1 && setMonth(availableMonths[monthIdx + 1])}
            disabled={monthIdx >= availableMonths.length - 1}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-gray-800 min-w-[80px] text-center">{year}年{Number(mon)}月</span>
          <button
            onClick={() => monthIdx > 0 && setMonth(availableMonths[monthIdx - 1])}
            disabled={monthIdx <= 0}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "月度收入", value: `¥${fmt(data.totalIncome)}`,
            sub: `上月 ¥${fmt(data.prevIncome)}`, trend: incomeTrend, color: "green" as const,
          },
          {
            label: "月度支出", value: `¥${fmt(data.totalExpense)}`,
            sub: `上月 ¥${fmt(data.prevExpense)}`, trend: expenseTrend, color: "red" as const,
          },
          {
            label: "月度净利润", value: `¥${fmt(data.netProfit)}`,
            sub: `利润率 ${data.profitMargin.toFixed(1)}%`, color: data.netProfit >= 0 ? "blue" as const : "red" as const,
          },
          {
            label: "记录笔数", value: `${data.count} 笔`,
            sub: `有效交易日 ${data.dailyData.filter((d) => d.hasActivity).length} 天`, color: "purple" as const,
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">{card.label}</div>
            <div className={`text-xl font-bold bg-gradient-to-r ${
              card.color === "green" ? "from-green-500 to-emerald-600" :
              card.color === "red" ? "from-red-500 to-rose-600" :
              card.color === "blue" ? "from-blue-500 to-indigo-600" :
              "from-purple-500 to-violet-600"
            } bg-clip-text text-transparent mb-1`}>
              {card.value}
            </div>
            <div className="text-xs text-gray-400">{card.sub}</div>
            {"trend" in card && card.trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${
                card.trend === 0 ? "text-gray-400" : card.trend > 0 ? "text-green-600" : "text-red-500"
              }`}>
                {card.trend === 0 ? <span>与上月持平</span> : (
                  <>
                    {card.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    较上月{card.trend > 0 ? "+" : ""}{card.trend.toFixed(1)}%
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 日历热力图 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">每日收支热力图</h3>
        <DailyHeatmap dailyData={data.dailyData} year={year} month={mon} />
      </div>

      {/* 周度趋势 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">按周收支趋势</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data.weekData.map((w) => ({ ...w, profit: w.income - w.expense }))}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: number, name: string) => [
                `¥${new Intl.NumberFormat("zh-CN").format(v)}`,
                name === "income" ? "收入" : name === "expense" ? "支出" : "利润",
              ]}
            />
            <Bar dataKey="income" name="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 收入/支出分类明细 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 收入分类 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            收入分类明细
            <span className="ml-auto text-xs text-gray-400 font-normal">点击展开子分类</span>
          </h3>
          {Object.keys(data.incomeCatDetail).length === 0 ? (
            <div className="h-20 flex items-center justify-center text-gray-400 text-sm">本月暂无收入</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(data.incomeCatDetail)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([name, detail]) => (
                  <CategoryDetail
                    key={name}
                    name={name}
                    total={detail.total}
                    grandTotal={data.totalIncome}
                    subs={detail.subs}
                    color={INCOME_CATEGORIES.find((c) => c.name === name)?.color || "#22c55e"}
                    type="income"
                  />
                ))}
            </div>
          )}
        </div>

        {/* 支出分类 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            支出分类明细
            <span className="ml-auto text-xs text-gray-400 font-normal">点击展开子分类</span>
          </h3>
          {Object.keys(data.expenseCatDetail).length === 0 ? (
            <div className="h-20 flex items-center justify-center text-gray-400 text-sm">本月暂无支出</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(data.expenseCatDetail)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([name, detail]) => (
                  <CategoryDetail
                    key={name}
                    name={name}
                    total={detail.total}
                    grandTotal={data.totalExpense}
                    subs={detail.subs}
                    color={EXPENSE_CATEGORIES.find((c) => c.name === name)?.color || "#ef4444"}
                    type="expense"
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 最大单笔 */}
      {(data.maxIncomeTx || data.maxExpenseTx) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.maxIncomeTx && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-green-600 font-semibold mb-1">本月最大收入</div>
                <div className="text-lg font-bold text-gray-800">¥{fmt(data.maxIncomeTx.amount)}</div>
                <div className="text-xs text-gray-500 truncate mt-0.5">{data.maxIncomeTx.description}</div>
                <div className="text-xs text-gray-400 mt-0.5">{data.maxIncomeTx.date} · {data.maxIncomeTx.category}</div>
              </div>
            </div>
          )}
          {data.maxExpenseTx && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100 p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-orange-600 font-semibold mb-1">本月最大支出</div>
                <div className="text-lg font-bold text-gray-800">¥{fmt(data.maxExpenseTx.amount)}</div>
                <div className="text-xs text-gray-500 truncate mt-0.5">{data.maxExpenseTx.description}</div>
                <div className="text-xs text-gray-400 mt-0.5">{data.maxExpenseTx.date} · {data.maxExpenseTx.category}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 上月对比表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">与上月对比</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs text-gray-400 font-medium py-2 pr-4">指标</th>
              <th className="text-right text-xs text-gray-400 font-medium py-2 px-4">上月</th>
              <th className="text-right text-xs text-gray-400 font-medium py-2 px-4">本月</th>
              <th className="text-right text-xs text-gray-400 font-medium py-2 pl-4">环比变化</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "总收入", curr: data.totalIncome, prev: data.prevIncome },
              { label: "总支出", curr: data.totalExpense, prev: data.prevExpense },
              { label: "净利润", curr: data.netProfit, prev: data.prevProfit },
            ].map(({ label, curr, prev }) => {
              const diff = prev !== 0 ? ((curr - prev) / Math.abs(prev)) * 100 : 0
              const isUp = curr >= prev
              return (
                <tr key={label} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 text-gray-700 font-medium text-xs">{label}</td>
                  <td className="py-3 px-4 text-right text-gray-400 text-xs">¥{fmt(prev)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-800 text-xs">¥{fmt(curr)}</td>
                  <td className="py-3 pl-4 text-right text-xs">
                    {prev === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <span className={`flex items-center justify-end gap-1 font-medium ${isUp ? "text-green-600" : "text-red-500"}`}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isUp ? "+" : ""}{diff.toFixed(1)}%
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

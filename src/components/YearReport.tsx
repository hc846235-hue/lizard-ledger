import { useState } from "react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from "recharts"
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, Award, Calendar } from "lucide-react"
import type { Transaction } from "@/types"
import { useReports } from "@/hooks/useReports"

interface YearReportProps {
  transactions: Transaction[]
}

function StatCard({
  label, value, sub, trend, color = "green",
}: {
  label: string
  value: string
  sub?: string
  trend?: { value: number; label: string }
  color?: "green" | "red" | "blue" | "purple"
}) {
  const colors = {
    green: "from-green-500 to-emerald-600",
    red: "from-red-500 to-rose-600",
    blue: "from-blue-500 to-indigo-600",
    purple: "from-purple-500 to-violet-600",
  }
  const trendUp = trend && trend.value > 0
  const trendFlat = trend && trend.value === 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      <div className={`text-2xl font-bold bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          trendFlat ? "text-gray-400" : trendUp ? "text-green-600" : "text-red-500"
        }`}>
          {trendFlat ? <Minus className="h-3 w-3" /> : trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trendFlat ? "与去年持平" : `较去年${trendUp ? "+" : ""}${trend.value.toFixed(1)}% ${trend.label}`}
        </div>
      )}
    </div>
  )
}

function CategoryBar({ name, value, total, color }: { name: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-700 font-medium truncate max-w-[120px]">{name}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-400">{pct.toFixed(1)}%</span>
          <span className="font-semibold text-gray-800">¥{new Intl.NumberFormat("zh-CN").format(value)}</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

const tooltipStyle = {
  contentStyle: { fontSize: 12, borderRadius: 10, border: "1px solid #f0f0f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  itemStyle: { fontSize: 12 },
}

export function YearReport({ transactions }: YearReportProps) {
  const { availableYears, getYearReport, fmt } = useReports(transactions)
  const currentYear = new Date().getFullYear().toString()
  const [year, setYear] = useState(availableYears[0] || currentYear)

  const data = getYearReport(year)
  const yearIdx = availableYears.indexOf(year)

  const incomeTrend = data.prevIncome > 0
    ? ((data.totalIncome - data.prevIncome) / data.prevIncome) * 100
    : 0
  const expenseTrend = data.prevExpense > 0
    ? ((data.totalExpense - data.prevExpense) / data.prevExpense) * 100
    : 0
  const profitTrend = data.prevProfit !== 0
    ? ((data.netProfit - data.prevProfit) / Math.abs(data.prevProfit)) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* 年份选择器 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">年度报表</h2>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
          <button
            onClick={() => yearIdx < availableYears.length - 1 && setYear(availableYears[yearIdx + 1])}
            disabled={yearIdx >= availableYears.length - 1}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-gray-800 min-w-[60px] text-center">{year} 年</span>
          <button
            onClick={() => yearIdx > 0 && setYear(availableYears[yearIdx - 1])}
            disabled={yearIdx <= 0}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 四个统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="年度总收入"
          value={`¥${fmt(data.totalIncome)}`}
          sub={`共 ${data.count} 笔账目`}
          trend={{ value: incomeTrend, label: "收入" }}
          color="green"
        />
        <StatCard
          label="年度总支出"
          value={`¥${fmt(data.totalExpense)}`}
          trend={{ value: expenseTrend, label: "支出" }}
          color="red"
        />
        <StatCard
          label="年度净利润"
          value={`¥${fmt(data.netProfit)}`}
          sub={`利润率 ${data.profitMargin.toFixed(1)}%`}
          trend={{ value: profitTrend, label: "利润" }}
          color={data.netProfit >= 0 ? "blue" : "red"}
        />
        <StatCard
          label="季度最高利润"
          value={data.quarterData.reduce((a, b) => a.profit > b.profit ? a : b).quarter}
          sub={`¥${fmt(data.quarterData.reduce((a, b) => a.profit > b.profit ? a : b).profit)}`}
          color="purple"
        />
      </div>

      {/* 12个月趋势 - 面积图 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">全年收支走势</h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />收入</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />支出</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />利润</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: number, name: string) => [
                `¥${new Intl.NumberFormat("zh-CN").format(v)}`,
                name === "income" ? "收入" : name === "expense" ? "支出" : "利润",
              ]}
            />
            <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#gIncome)" dot={false} />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#gExpense)" dot={false} />
            <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fill="url(#gProfit)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 季度对比 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">季度收支对比</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.quarterData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="quarter" tick={{ fontSize: 12, fontWeight: 600 }} />
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

      {/* 分类排行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 收入分类 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            收入来源排行
          </h3>
          {data.incomeCategoryRank.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">暂无收入数据</div>
          ) : (
            <div className="space-y-3">
              {data.incomeCategoryRank.map((cat) => (
                <CategoryBar
                  key={cat.name}
                  name={cat.name}
                  value={cat.value}
                  total={data.totalIncome}
                  color={cat.color}
                />
              ))}
            </div>
          )}
        </div>

        {/* 支出分类 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            支出构成排行
          </h3>
          {data.expenseCategoryRank.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">暂无支出数据</div>
          ) : (
            <div className="space-y-3">
              {data.expenseCategoryRank.map((cat) => (
                <CategoryBar
                  key={cat.name}
                  name={cat.name}
                  value={cat.value}
                  total={data.totalExpense}
                  color={cat.color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 年度亮点 */}
      {(data.bestMonth || data.worstMonth) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.bestMonth && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-green-600 font-semibold mb-1">年度最佳月份</div>
                <div className="text-lg font-bold text-gray-800">{data.bestMonth.month}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  净利润 <span className="font-bold text-green-600">¥{fmt(data.bestMonth.profit)}</span>
                  　收入 ¥{fmt(data.bestMonth.income)}　支出 ¥{fmt(data.bestMonth.expense)}
                </div>
              </div>
            </div>
          )}
          {data.worstMonth && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100 p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-xs text-orange-600 font-semibold mb-1">最需关注月份</div>
                <div className="text-lg font-bold text-gray-800">{data.worstMonth.month}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  净利润 <span className={`font-bold ${data.worstMonth.profit >= 0 ? "text-green-600" : "text-red-500"}`}>¥{fmt(data.worstMonth.profit)}</span>
                  　收入 ¥{fmt(data.worstMonth.income)}　支出 ¥{fmt(data.worstMonth.expense)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 同比对照表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">与上一年同比对照</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-medium py-2 pr-4">指标</th>
                <th className="text-right text-xs text-gray-400 font-medium py-2 px-4">{String(Number(year) - 1)}年</th>
                <th className="text-right text-xs text-gray-400 font-medium py-2 px-4">{year}年</th>
                <th className="text-right text-xs text-gray-400 font-medium py-2 pl-4">同比变化</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "总收入", curr: data.totalIncome, prev: data.prevIncome, up: "green" },
                { label: "总支出", curr: data.totalExpense, prev: data.prevExpense, up: "red" },
                { label: "净利润", curr: data.netProfit, prev: data.prevProfit, up: "green" },
              ].map(({ label, curr, prev, up }) => {
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
                        <span className={`flex items-center justify-end gap-1 font-medium ${
                          (up === "green" && isUp) || (up === "red" && !isUp) ? "text-green-600" : "text-red-500"
                        }`}>
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
    </div>
  )
}

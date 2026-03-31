import { useMemo } from "react"
import type { Transaction } from "@/types"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types"

const fmt = (n: number) =>
  new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2 }).format(n)

export function useReports(transactions: Transaction[]) {
  // ─── 可用年份列表 ───
  const availableYears = useMemo(() => {
    const years = new Set(transactions.map((t) => t.date.slice(0, 4)))
    const currentYear = new Date().getFullYear().toString()
    years.add(currentYear)
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }, [transactions])

  // ─── 年度报表数据 ───
  const getYearReport = (year: string) => {
    const yearTxs = transactions.filter((t) => t.date.startsWith(year))
    const prevYearTxs = transactions.filter((t) =>
      t.date.startsWith(String(Number(year) - 1))
    )

    // 12个月趋势
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = `${year}-${String(i + 1).padStart(2, "0")}`
      const txs = yearTxs.filter((t) => t.date.startsWith(month))
      const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
      const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
      return {
        month: `${i + 1}月`,
        income,
        expense,
        profit: income - expense,
      }
    })

    // 收入分类汇总
    const incomeByCategory: Record<string, number> = {}
    yearTxs
      .filter((t) => t.type === "income")
      .forEach((t) => {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount
      })
    const incomeCategoryRank = Object.entries(incomeByCategory)
      .map(([name, value]) => ({
        name,
        value,
        color: INCOME_CATEGORIES.find((c) => c.name === name)?.color || "#22c55e",
      }))
      .sort((a, b) => b.value - a.value)

    // 支出分类汇总
    const expenseByCategory: Record<string, number> = {}
    yearTxs
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
      })
    const expenseCategoryRank = Object.entries(expenseByCategory)
      .map(([name, value]) => ({
        name,
        value,
        color: EXPENSE_CATEGORIES.find((c) => c.name === name)?.color || "#ef4444",
      }))
      .sort((a, b) => b.value - a.value)

    // 年度汇总
    const totalIncome = yearTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const totalExpense = yearTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    const prevIncome = prevYearTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const prevExpense = prevYearTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)

    // 最高利润月 & 最低利润月
    const profitMonths = monthlyData.filter((m) => m.income > 0 || m.expense > 0)
    const bestMonth = profitMonths.length ? profitMonths.reduce((a, b) => (a.profit > b.profit ? a : b)) : null
    const worstMonth = profitMonths.length ? profitMonths.reduce((a, b) => (a.profit < b.profit ? a : b)) : null

    // 季度数据
    const quarterData = [
      { quarter: "Q1", months: [0, 1, 2] },
      { quarter: "Q2", months: [3, 4, 5] },
      { quarter: "Q3", months: [6, 7, 8] },
      { quarter: "Q4", months: [9, 10, 11] },
    ].map(({ quarter, months }) => {
      const income = months.reduce((s, m) => s + monthlyData[m].income, 0)
      const expense = months.reduce((s, m) => s + monthlyData[m].expense, 0)
      return { quarter, income, expense, profit: income - expense }
    })

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      count: yearTxs.length,
      prevIncome,
      prevExpense,
      prevProfit: prevIncome - prevExpense,
      monthlyData,
      incomeCategoryRank,
      expenseCategoryRank,
      bestMonth,
      worstMonth,
      quarterData,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
    }
  }

  // ─── 月度报表数据 ───
  const getMonthReport = (yearMonth: string) => {
    const monthTxs = transactions.filter((t) => t.date.startsWith(yearMonth))
    const [year, month] = yearMonth.split("-")
    const prevMonth = month === "01"
      ? `${Number(year) - 1}-12`
      : `${year}-${String(Number(month) - 1).padStart(2, "0")}`
    const prevMonthTxs = transactions.filter((t) => t.date.startsWith(prevMonth))

    // 按日汇总
    const dayMap: Record<string, { income: number; expense: number }> = {}
    monthTxs.forEach((t) => {
      const day = t.date.slice(8, 10)
      if (!dayMap[day]) dayMap[day] = { income: 0, expense: 0 }
      if (t.type === "income") dayMap[day].income += t.amount
      else dayMap[day].expense += t.amount
    })

    // 日历热力数据（当月每天）
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate()
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, "0")
      const d = dayMap[day] || { income: 0, expense: 0 }
      return {
        day: i + 1,
        label: `${Number(month)}/${i + 1}`,
        income: d.income,
        expense: d.expense,
        profit: d.income - d.expense,
        hasActivity: d.income > 0 || d.expense > 0,
      }
    })

    // 按周汇总（4/5周）
    const weekData: { week: string; income: number; expense: number }[] = []
    for (let w = 0; w < 5; w++) {
      const start = w * 7 + 1
      const end = Math.min(start + 6, daysInMonth)
      if (start > daysInMonth) break
      const wTxs = monthTxs.filter((t) => {
        const d = Number(t.date.slice(8, 10))
        return d >= start && d <= end
      })
      weekData.push({
        week: `第${w + 1}周`,
        income: wTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: wTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      })
    }

    // 收入/支出分类明细（含子分类）
    const incomeCatDetail: Record<string, { total: number; subs: Record<string, number> }> = {}
    monthTxs
      .filter((t) => t.type === "income")
      .forEach((t) => {
        if (!incomeCatDetail[t.category]) incomeCatDetail[t.category] = { total: 0, subs: {} }
        incomeCatDetail[t.category].total += t.amount
        incomeCatDetail[t.category].subs[t.subCategory] =
          (incomeCatDetail[t.category].subs[t.subCategory] || 0) + t.amount
      })

    const expenseCatDetail: Record<string, { total: number; subs: Record<string, number> }> = {}
    monthTxs
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (!expenseCatDetail[t.category]) expenseCatDetail[t.category] = { total: 0, subs: {} }
        expenseCatDetail[t.category].total += t.amount
        expenseCatDetail[t.category].subs[t.subCategory] =
          (expenseCatDetail[t.category].subs[t.subCategory] || 0) + t.amount
      })

    const totalIncome = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const totalExpense = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    const prevIncome = prevMonthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const prevExpense = prevMonthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)

    // 最大单笔
    const maxIncomeTx = monthTxs
      .filter((t) => t.type === "income")
      .sort((a, b) => b.amount - a.amount)[0] || null
    const maxExpenseTx = monthTxs
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.amount - a.amount)[0] || null

    return {
      yearMonth,
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      count: monthTxs.length,
      prevIncome,
      prevExpense,
      prevProfit: prevIncome - prevExpense,
      dailyData,
      weekData,
      incomeCatDetail,
      expenseCatDetail,
      maxIncomeTx,
      maxExpenseTx,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
    }
  }

  // 可用月份列表
  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map((t) => t.date.slice(0, 7)))
    const now = new Date()
    months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
    return Array.from(months).sort((a, b) => b.localeCompare(a))
  }, [transactions])

  return { availableYears, availableMonths, getYearReport, getMonthReport, fmt }
}

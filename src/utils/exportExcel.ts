import * as XLSX from "xlsx"
import type { Transaction } from "@/types"

/**
 * 将账目明细导出为 JSON 文件（完整备份）
 */
export function exportTransactionsToJSON(
  transactions: Transaction[],
  filename?: string
) {
  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    totalTransactions: transactions.length,
    transactions: transactions,
  }

  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  const today = new Date().toISOString().slice(0, 10)
  a.download = filename || `蜥蜴账本_备份_${today}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 将账目明细导出为 CSV 文件
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  filename?: string
) {
  // 按日期降序排序
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // CSV 头部
  const headers = ["日期", "类型", "分类", "子分类", "金额", "描述", "备注", "录入时间"]

  // CSV 数据行
  const rows = sorted.map((t) => [
    t.date,
    t.type === "income" ? "收入" : "支出",
    t.category,
    t.subCategory,
    t.amount.toString(),
    t.description,
    t.notes,
    new Date(t.createdAt).toLocaleString("zh-CN"),
  ])

  // 计算汇总
  const totalIncome = sorted
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = sorted
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)

  // 添加汇总行
  rows.push([])
  rows.push([
    "汇总",
    "",
    "",
    "",
    "",
    `总收入：¥${totalIncome.toFixed(2)}`,
    `总支出：¥${totalExpense.toFixed(2)}`,
    `净收益：¥${(totalIncome - totalExpense).toFixed(2)}`,
  ])

  // 转换为 CSV 格式
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => {
        // 处理包含逗号或引号的内容
        if (cell.includes(",") || cell.includes('"')) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(",")
    ),
  ].join("\n")

  // 添加 BOM 以支持 Excel 正确显示中文
  const bom = "\uFEFF"
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  const today = new Date().toISOString().slice(0, 10)
  a.download = filename || `蜥蜴账本_${today}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 将账目明细导出为 Excel 文件
 */
export function exportTransactionsToExcel(
  transactions: Transaction[],
  filename?: string
) {
  // 按日期降序排序
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // 构造表格数据
  const rows = sorted.map((t) => ({
    日期: t.date,
    类型: t.type === "income" ? "收入" : "支出",
    分类: t.category,
    子分类: t.subCategory,
    金额: t.amount,
    描述: t.description,
    备注: t.notes,
    录入时间: new Date(t.createdAt).toLocaleString("zh-CN"),
  }))

  // 汇总行
  const totalIncome = sorted
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = sorted
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)

  const summaryRows = [
    {},
    {
      日期: "汇总",
      类型: "",
      分类: "",
      子分类: "",
      金额: "",
      描述: `总收入：¥${totalIncome.toFixed(2)}`,
      备注: `总支出：¥${totalExpense.toFixed(2)}`,
      录入时间: `净收益：¥${(totalIncome - totalExpense).toFixed(2)}`,
    },
  ]

  const allRows = [...rows, ...summaryRows]

  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(allRows)

  // 设置列宽
  ws["!cols"] = [
    { wch: 12 }, // 日期
    { wch: 6 },  // 类型
    { wch: 12 }, // 分类
    { wch: 18 }, // 子分类
    { wch: 10 }, // 金额
    { wch: 24 }, // 描述
    { wch: 20 }, // 备注
    { wch: 20 }, // 录入时间
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "账目明细")

  // 生成文件名
  const today = new Date().toISOString().slice(0, 10)
  const name = filename || `蜥蜴账本_${today}.xlsx`

  // 下载
  XLSX.writeFile(wb, name)
}

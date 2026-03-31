import * as XLSX from "xlsx"
import type { Transaction } from "@/types"

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

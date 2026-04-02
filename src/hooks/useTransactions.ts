import { useState, useEffect, useCallback } from "react"
import type { Transaction } from "../types"
import { format } from "date-fns"

const STORAGE_KEY = "lizard-ledger-transactions"
const BACKUP_KEY = "lizard-ledger-backup"

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    date: "2026-03-01",
    type: "income",
    category: "蓝舌销售",
    subCategory: "幼体出售",
    amount: 3500,
    description: "出售印尼蓝舌幼体 ×2",
    notes: "买家来自广州，健康活泼",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "2",
    date: "2026-03-03",
    type: "expense",
    category: "饲料饲养",
    subCategory: "活食（蟋蟀/杜比亚）",
    amount: 280,
    description: "购入杜比亚 500只",
    notes: "本月补货",
    createdAt: "2026-03-03T09:00:00Z",
  },
  {
    id: "3",
    date: "2026-03-05",
    type: "expense",
    category: "设备器材",
    subCategory: "加热设备",
    amount: 650,
    description: "爬宠专用陶瓷发热灯 ×2",
    notes: "旧灯坏了，紧急更换",
    createdAt: "2026-03-05T14:00:00Z",
  },
  {
    id: "4",
    date: "2026-03-07",
    type: "income",
    category: "蓝舌销售",
    subCategory: "亚成体出售",
    amount: 6200,
    description: "出售澳洲北部蓝舌亚成体 ×1",
    notes: "品相优秀，买家很满意",
    createdAt: "2026-03-07T11:00:00Z",
  },
  {
    id: "5",
    date: "2026-03-10",
    type: "expense",
    category: "运营费用",
    subCategory: "快递包装",
    amount: 420,
    description: "保温箱、包装材料采购",
    notes: "",
    createdAt: "2026-03-10T09:30:00Z",
  },
  {
    id: "6",
    date: "2026-03-12",
    type: "expense",
    category: "兽医医疗",
    subCategory: "药品费",
    amount: 180,
    description: "驱虫药品采购",
    notes: "定期预防",
    createdAt: "2026-03-12T15:00:00Z",
  },
  {
    id: "7",
    date: "2026-03-14",
    type: "income",
    category: "繁育服务",
    subCategory: "寄养费",
    amount: 800,
    description: "客户寄养蓝舌 ×2只，30天",
    notes: "",
    createdAt: "2026-03-14T10:00:00Z",
  },
  {
    id: "8",
    date: "2026-03-15",
    type: "expense",
    category: "饲料饲养",
    subCategory: "蔬菜水果",
    amount: 95,
    description: "羽衣甘蓝、南瓜、芒果",
    notes: "本周采购",
    createdAt: "2026-03-15T08:00:00Z",
  },
]

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const backup = localStorage.getItem(BACKUP_KEY)

      // 优先从主存储读取
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('从主存储加载账单，数量:', parsed.length)
        return parsed
      }

      // 如果主存储为空，尝试从备份恢复
      if (backup) {
        const parsed = JSON.parse(backup)
        console.log('从备份恢复账单，数量:', parsed.data?.length)
        return parsed.data || SAMPLE_TRANSACTIONS
      }

      console.log('使用示例账单')
      return SAMPLE_TRANSACTIONS
    } catch (error) {
      console.error('读取本地账单失败，使用示例数据:', error)
      return SAMPLE_TRANSACTIONS
    }
  })

  useEffect(() => {
    try {
      console.log('保存本地账单，数量:', transactions.length)

      // 主存储
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
      console.log('主存储保存成功')

      // 备份存储（带时间戳）
      const backupData = {
        timestamp: new Date().toISOString(),
        data: transactions
      }
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backupData))
      console.log('备份存储保存成功')
    } catch (error) {
      console.error("保存本地账单失败:", error)
    }
  }, [transactions])

  const addTransaction = useCallback((tx: Omit<Transaction, "id" | "createdAt">) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setTransactions((prev) => [newTx, ...prev])
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }, [])

  const getStats = useCallback(
    (month?: string) => {
      const filtered = month
        ? transactions.filter((tx) => tx.date.startsWith(month))
        : transactions

      const totalIncome = filtered
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0)

      const totalExpense = filtered
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0)

      return {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        count: filtered.length,
      }
    },
    [transactions]
  )

  const getCurrentMonth = useCallback(() => {
    return format(new Date(), "yyyy-MM")
  }, [])

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
    getCurrentMonth,
  }
}

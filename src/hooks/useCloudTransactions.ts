import { useState, useEffect, useCallback } from "react"
import type { Transaction } from "../types"
import { getBills, addBill, updateBill as updateBillDB, deleteBill as deleteBillDB } from "../services/db"

/**
 * 将 Transaction 转换为 Bill 格式
 */
function transactionToBill(tx: Transaction | Omit<Transaction, "id" | "createdAt">) {
  return {
    date: tx.date,
    category: `${tx.category} - ${tx.subCategory || ''}`,
    amount: tx.type === 'income' ? Math.abs(tx.amount) : -Math.abs(tx.amount),
    note: tx.description + (tx.notes ? ` | ${tx.notes}` : ''),
  }
}

/**
 * 将 Bill 转换回 Transaction 格式
 */
function billToTransaction(bill: any): Transaction {
  // 解析 category 字段（格式：主分类 - 子分类）
  const [category, subCategory] = bill.category.split(' - ')

  return {
    id: bill._id,
    date: bill.date,
    type: bill.amount >= 0 ? 'income' : 'expense',
    category: category.trim(),
    subCategory: subCategory?.trim() || '',
    amount: Math.abs(bill.amount),
    description: bill.note?.split(' | ')[0] || '',
    notes: bill.note?.split(' | ')[1] || '',
    createdAt: bill.createdAt || new Date().toISOString(),
  }
}

export function useCloudTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // 从云端加载账单
  useEffect(() => {
    loadBills()
  }, [])

  const loadBills = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('开始加载账单...')

      const bills = await getBills()
      const txs = bills.map(billToTransaction)

      console.log(`成功加载 ${txs.length} 条账单`)
      setTransactions(txs)
    } catch (error: any) {
      console.error('加载账单失败:', error)
      setError(error?.message || '加载账单失败')
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id" | "createdAt">) => {
    try {
      setIsSaving(true)
      setError(null)

      console.log('开始添加账单:', tx)
      const bill = transactionToBill(tx)
      const result = await addBill(bill)

      console.log('账单添加成功，ID:', result._id)

      // 重新加载账单列表
      await loadBills()

      return result
    } catch (error: any) {
      console.error('添加账单失败:', error)
      setError(error?.message || '添加账单失败')
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      setIsSaving(true)
      setError(null)

      console.log('开始更新账单，ID:', id, '更新:', updates)

      // 先找到对应的账单
      const tx = transactions.find(t => t.id === id)
      if (!tx) {
        throw new Error('账单不存在')
      }

      const updatedTx = { ...tx, ...updates }
      const bill = transactionToBill(updatedTx)

      await updateBillDB(id, bill)

      console.log('账单更新成功')

      // 重新加载账单列表
      await loadBills()
    } catch (error: any) {
      console.error('更新账单失败:', error)
      setError(error?.message || '更新账单失败')
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [transactions])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setIsSaving(true)
      setError(null)

      console.log('开始删除账单，ID:', id)

      await deleteBillDB(id)

      console.log('账单删除成功')

      // 重新加载账单列表
      await loadBills()
    } catch (error: any) {
      console.error('删除账单失败:', error)
      setError(error?.message || '删除账单失败')
      throw error
    } finally {
      setIsSaving(false)
    }
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

  return {
    transactions,
    loading,
    error,
    isSaving,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
    refresh: loadBills,
  }
}

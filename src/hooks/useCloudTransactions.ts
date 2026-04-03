import { useState, useEffect, useCallback } from "react"
import type { Transaction } from "../types"
import { getBills, addBill, updateBill as updateBillDB, deleteBill as deleteBillDB } from "../services/airtableDb"
import { hasValidApiKey } from "../services/airtable"

/**
 * 将 Transaction 转换为 Bill 格式
 */
function transactionToBill(tx: Transaction | Omit<Transaction, "id" | "createdAt">) {
  return {
    date: tx.date,
    category: tx.category,
    amount: tx.type === 'income' ? Math.abs(tx.amount) : -Math.abs(tx.amount),
    note: `${tx.description}${tx.notes ? ` | ${tx.notes}` : ''}`,
    type: tx.type,
    subCategory: tx.subCategory || '',
  }
}

/**
 * 将 Bill 转换回 Transaction 格式
 */
function billToTransaction(bill: any): Transaction {
  return {
    id: bill._id,
    date: bill.date,
    type: bill.type || (bill.amount >= 0 ? 'income' : 'expense'),
    category: bill.category || '',
    subCategory: bill.subCategory || '',
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

  // 检查 Airtable 是否可用
  const isAirtableAvailable = hasValidApiKey

  // 从云端加载账单
  useEffect(() => {
    // 如果 Airtable 不可用，不执行任何操作
    if (!isAirtableAvailable) {
      console.warn('⚠️ Airtable 不可用，跳过云端数据加载')
      setLoading(false)
      return
    }

    loadBills()
  }, [isAirtableAvailable])

  const loadBills = async (retryCount = 0) => {
    // 如果 Airtable 不可用，不执行
    if (!isAirtableAvailable) {
      console.warn('⚠️ Airtable 不可用，无法加载账单')
      setLoading(false)
      return
    }

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

      // 网络错误时重试
      if (retryCount < 2 && (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT')) {
        console.log(`网络错误，第 ${retryCount + 1} 次重试...`)
        setTimeout(() => loadBills(retryCount + 1), 1000 * (retryCount + 1))
        return
      }

      setError(error?.message || '加载账单失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id" | "createdAt">) => {
    // 如果 Airtable 不可用，不执行任何操作
    if (!isAirtableAvailable) {
      console.warn('⚠️ Airtable 不可用，无法添加账单')
      throw new Error('Airtable 不可用，请先配置 API Key')
    }

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

      // 网络错误时提供更友好的提示
      const errorMsg = error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT'
        ? '网络连接失败，请检查网络后重试'
        : error?.message || '添加账单失败，请稍后重试'

      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }, [isAirtableAvailable])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    // 如果 Airtable 不可用，不执行任何操作
    if (!isAirtableAvailable) {
      console.warn('⚠️ Airtable 不可用，无法更新账单')
      throw new Error('Airtable 不可用，请先配置 API Key')
    }

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

      const errorMsg = error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT'
        ? '网络连接失败，请检查网络后重试'
        : error?.message || '更新账单失败，请稍后重试'

      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }, [transactions, isAirtableAvailable])

  const deleteTransaction = useCallback(async (id: string) => {
    // 如果 Airtable 不可用，不执行任何操作
    if (!isAirtableAvailable) {
      console.warn('⚠️ Airtable 不可用，无法删除账单')
      throw new Error('Airtable 不可用，请先配置 API Key')
    }

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

      const errorMsg = error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT'
        ? '网络连接失败，请检查网络后重试'
        : error?.message || '删除账单失败，请稍后重试'

      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }, [isAirtableAvailable])

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

import { useState, useEffect, useCallback } from "react"
import type { Transaction } from "../types"
import { getBills, addBill, updateBill as updateBillDB, deleteBill as deleteBillDB } from "../services/db"

/**
 * 将 Transaction 转换为 Bill 格式
 */
function transactionToBill(tx: Transaction) {
  return {
    date: tx.date,
    category: `${tx.category} - ${tx.subCategory || ''}`,
    amount: tx.amount,
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

  // 从云端加载账单
  useEffect(() => {
    loadBills()
  }, [])

  const loadBills = async () => {
    try {
      setLoading(true)
      const bills = await getBills()
      const txs = bills.map(billToTransaction)
      setTransactions(txs)
    } catch (error) {
      console.error('加载账单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id" | "createdAt">) => {
    try {
      const bill = transactionToBill(tx)
      await addBill(bill)
      await loadBills() // 重新加载
    } catch (error) {
      console.error('添加账单失败:', error)
      throw error
    }
  }, [])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      // 先找到对应的账单
      const tx = transactions.find(t => t.id === id)
      if (!tx) throw new Error('账单不存在')

      const updatedTx = { ...tx, ...updates }
      const bill = transactionToBill(updatedTx)
      
      await updateBillDB(id, bill)
      await loadBills() // 重新加载
    } catch (error) {
      console.error('更新账单失败:', error)
      throw error
    }
  }, [transactions])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await deleteBillDB(id)
      await loadBills() // 重新加载
    } catch (error) {
      console.error('删除账单失败:', error)
      throw error
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
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
    refresh: loadBills,
  }
}

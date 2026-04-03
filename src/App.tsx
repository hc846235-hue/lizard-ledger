import React, { useState, useEffect } from "react"
import { Plus, BookOpen, BarChart2, List, LogOut, FileText, Download, Cloud, Database, MoreHorizontal, FileJson, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCards } from "@/components/StatsCards"
import { Charts } from "@/components/Charts"
import { TransactionForm } from "@/components/TransactionForm"
import { TransactionList } from "@/components/TransactionList"
import { YearReport } from "@/components/YearReport"
import { MonthReport } from "@/components/MonthReport"
import { SmartInput } from "@/components/SmartInput"
import { useTransactions } from "@/hooks/useTransactions"
import { useCloudTransactions } from "@/hooks/useCloudTransactions"
import { exportTransactionsToExcel, exportTransactionsToJSON, exportTransactionsToCSV } from "@/utils/exportExcel"
import type { Transaction } from "@/types"

type Tab = "overview" | "detail" | "report"
type ReportSubTab = "year" | "month"
type DataSource = "local" | "cloud"

export default function App() {
  console.log('App component rendering...')

  // 数据源切换 - 默认使用本地存储
  const [dataSource, setDataSource] = useState<DataSource>("local")
  const localHook = useTransactions()
  const cloudHook = useCloudTransactions()

  console.log('Hooks loaded:', {
    dataSource,
    cloudLoading: cloudHook.loading,
    localTransactions: localHook.transactions.length,
    cloudTransactions: cloudHook.transactions.length
  })

  // 根据数据源选择对应的 hook
  const isCloud = dataSource === "cloud"
  const cloudData = cloudHook
  const localData = localHook
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getStats } =
    isCloud ? cloudData : localData
  const loading = isCloud ? cloudData.loading : false
  const refresh = isCloud ? cloudData.refresh : (() => {})
  const cloudError = isCloud ? cloudData.error : null
  const isSaving = isCloud ? cloudData.isSaving : false

  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>("year")
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<Transaction | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // 云端始终不可用（需要配置 Airtable API Key）
  const cloudAvailable = false

  console.log('State initialized:', {
    activeTab,
    dataSource,
    cloudAvailable,
    transactionsCount: transactions.length
  })

  const stats = getStats()
  console.log('Stats calculated:', stats)

  const handleEdit = (tx: Transaction) => {
    setEditData(tx)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: Omit<Transaction, "id" | "createdAt">) => {
    try {
      if (editData) {
        await updateTransaction(editData.id, data)
        setSuccessMessage(isCloud ? '账单已保存到云端' : '账单已保存到本地')
      } else {
        await addTransaction(data)
        setSuccessMessage(isCloud ? '账单已添加到云端' : '账单已添加到本地')
      }
      setEditData(null)
      setFormOpen(false)

      // 3秒后隐藏成功消息
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('保存失败:', error)
      setSuccessMessage(null)

      // 如果云端保存失败，提示用户可以切换到本地
      if (isCloud && error?.message) {
        alert(`云端保存失败: ${error.message}\n\n建议：\n1. 检查网络连接\n2. 切换到本地存储\n3. 稍后重试`)
      } else {
        alert(`保存失败: ${error?.message || '请稍后重试'}`)
      }
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditData(null)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
      setSuccessMessage(isCloud ? '账单已从云端删除' : '账单已从本地删除')
      // 3秒后隐藏成功消息
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('删除失败:', error)
      if (isCloud && error?.message) {
        alert(`云端删除失败: ${error?.message || '请稍后重试'}`)
      } else {
        alert(`删除失败: ${error?.message || '请稍后重试'}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-6">
      {/* 成功提示 */}
      {successMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
          ✓ {successMessage}
        </div>
      )}

      {/* 保存中提示 */}
      {isSaving && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          保存中...
        </div>
      )}

      {/* 错误提示 */}
      {cloudError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer" onClick={() => {}}>
          ✗ {cloudError}
        </div>
      )}

      {/* 云端状态指示器 */}
      {!cloudAvailable && (
        <div className="fixed top-28 left-1/2 transform -translate-x-1/2 z-40 bg-yellow-500 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs">
          ⚠️ 云端不可用，已使用本地存储
        </div>
      )}
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm safe-area-top">
        <div className="max-w-5xl mx-auto px-3 md:px-4 h-14 md:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="w-8 h-8 md:w-8 md:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-800 leading-tight">AX爬宠繁育基地</div>
              <div className="text-[10px] text-gray-400 leading-tight">记账明细系统</div>
            </div>
          </div>

          {/* 移动端简化 Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer min-h-[36px] md:min-h-[36px] ${
                activeTab === "overview"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">概览</span>
            </button>
            <button
              onClick={() => setActiveTab("detail")}
              className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer min-h-[36px] md:min-h-[36px] ${
                activeTab === "detail"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">明细</span>
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer min-h-[36px] md:min-h-[36px] ${
                activeTab === "report"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">报表</span>
            </button>
          </div>

          {/* 右侧操作区 */}
          <div className="hidden md:flex items-center gap-2">
            {/* 数据源切换 */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => {
                  if (!cloudAvailable) {
                    alert("云端存储需要配置 Airtable API Key\n\n步骤：\n1. 在项目根目录创建 .env 文件\n2. 添加 VITE_AIRTABLE_API_KEY=your_api_key\n3. 重启应用\n\n当前已使用本地存储模式")
                    return
                  }
                  setDataSource("cloud")
                  setSuccessMessage("已切换到云端存储")
                  setTimeout(() => setSuccessMessage(null), 3000)
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  dataSource === "cloud"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="使用云端数据库（数据永久保存）"
              >
                <Cloud className="h-3.5 w-3.5" />
                云端
              </button>
              <button
                onClick={() => {
                  setDataSource("local")
                  setSuccessMessage("已切换到本地存储")
                  setTimeout(() => setSuccessMessage(null), 3000)
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  dataSource === "local"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="使用本地存储（浏览器缓存）"
              >
                <Database className="h-3.5 w-3.5" />
                本地
              </button>
            </div>


          {/* 移动端数据源切换按钮 */}
          <div className="flex md:hidden items-center">
              <button
              onClick={() => {
                const newSource = dataSource === "cloud" ? "local" : "cloud"
                if (newSource === "cloud" && !cloudAvailable) {
                  alert("云端存储需要配置 Airtable API Key\n\n步骤：\n1. 在项目根目录创建 .env 文件\n2. 添加 VITE_AIRTABLE_API_KEY=your_api_key\n3. 重启应用\n\n当前已使用本地存储模式")
                  return
                }
                setDataSource(newSource)
                setSuccessMessage(newSource === "cloud" ? "已切换到云端存储" : "已切换到本地存储")
                setTimeout(() => setSuccessMessage(null), 3000)
              }}
              className={`w-9 h-9 md:w-9 md:h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer min-w-[36px] min-h-[36px] ${
                dataSource === "cloud"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={dataSource === "cloud" ? "切换到本地" : "切换到云端"}
            >
              <Cloud className="h-4 w-4 md:h-4 md:w-4" />
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* 移动端固定底部操作栏 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center justify-between">
          <Button
            size="sm"
            onClick={() => setFormOpen(true)}
            className="flex-1 gap-2 text-sm h-10 font-medium"
          >
            <Plus className="h-4 w-4" />
            新增账目
          </Button>

          {/* 更多操作按钮 */}
          <div className="relative">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              title="更多操作"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="pt-14 max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {activeTab === "overview" ? (
          <div className="space-y-4 md:space-y-6">
            {/* 智能快速记账 */}
            <SmartInput onConfirm={addTransaction} />

            <div>
              <h2 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 md:mb-3">
                总体概况
              </h2>
              <StatsCards
                totalIncome={stats.totalIncome}
                totalExpense={stats.totalExpense}
                netProfit={stats.netProfit}
                count={stats.count}
              />
            </div>

            <div>
              <h2 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 md:mb-3">
                数据分析
              </h2>
              <Charts transactions={transactions} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <h2 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  最近账目
                </h2>
                <button
                  onClick={() => setActiveTab("detail")}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  查看全部 →
                </button>
              </div>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 md:p-3 bg-white rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleEdit(tx)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {tx.description}
                      </div>
                      <div className="text-xs text-gray-400">{tx.date} · {tx.category}</div>
                    </div>
                    <div
                      className={`text-sm font-bold ml-3 shrink-0 ${
                        tx.type === "income" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      ¥{new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2 }).format(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === "detail" ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                账目明细
              </h2>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={transactions.length === 0}
                >
                  <Download className="h-3.5 w-3.5" />
                  导出数据
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={() => {
                        exportTransactionsToExcel(transactions)
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      Excel 文件
                    </button>
                    <button
                      onClick={() => {
                        exportTransactionsToCSV(transactions)
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                      CSV 文件
                    </button>
                    <button
                      onClick={() => {
                        exportTransactionsToJSON(transactions)
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-t"
                    >
                      <FileJson className="h-4 w-4 text-orange-600" />
                      JSON 备份
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* 智能快速记账 */}
            <div className="mb-5">
              <SmartInput onConfirm={addTransaction} />
            </div>
            <TransactionList
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          /* 报表页 */
          <div>
            {/* 年度/月度子Tab */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setReportSubTab("year")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    reportSubTab === "year"
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  年度报表
                </button>
                <button
                  onClick={() => setReportSubTab("month")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    reportSubTab === "month"
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  月度报表
                </button>
              </div>
            </div>
            {reportSubTab === "year" ? (
              <YearReport transactions={transactions} />
            ) : (
              <MonthReport transactions={transactions} />
            )}
          </div>
        )}
      </main>

      {/* 记账表单弹窗 */}
      <TransactionForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editData={editData}
      />

      {/* 退出登录确认 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Cloud className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">配置 Airtable API Key</h3>
            <p className="text-xs text-gray-400 mb-5">需要配置 Airtable API Key 才能使用云端存储</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-sm" onClick={() => setShowLogoutConfirm(false)}>
                取消
              </Button>
              <Button variant="destructive" className="flex-1 text-sm" onClick={() => setShowLogoutConfirm(false)}>
                了解
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

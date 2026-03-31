import { useState } from "react"
import { Plus, BookOpen, BarChart2, List, LogOut, KeyRound, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCards } from "@/components/StatsCards"
import { Charts } from "@/components/Charts"
import { TransactionForm } from "@/components/TransactionForm"
import { TransactionList } from "@/components/TransactionList"
import { LoginScreen } from "@/components/LoginScreen"
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog"
import { YearReport } from "@/components/YearReport"
import { MonthReport } from "@/components/MonthReport"
import { SmartInput } from "@/components/SmartInput"
import { useTransactions } from "@/hooks/useTransactions"
import { useAuth } from "@/hooks/useAuth"
import { exportTransactionsToExcel } from "@/utils/exportExcel"
import type { Transaction } from "@/types"

type Tab = "overview" | "detail" | "report"
type ReportSubTab = "year" | "month"

export default function App() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getStats } = useTransactions()
  const { isLoggedIn, login, logout, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>("year")
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<Transaction | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean>(isLoggedIn())
  const [changePwdOpen, setChangePwdOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const stats = getStats()

  // ── 登录处理 ──
  const handleLogin = (password: string): boolean => {
    const ok = login(password)
    if (ok) setLoggedIn(true)
    return ok
  }

  const handleLogout = () => {
    logout()
    setLoggedIn(false)
    setShowLogoutConfirm(false)
  }

  const handleEdit = (tx: Transaction) => {
    setEditData(tx)
    setFormOpen(true)
  }

  const handleFormSubmit = (data: Omit<Transaction, "id" | "createdAt">) => {
    if (editData) {
      updateTransaction(editData.id, data)
    } else {
      addTransaction(data)
    }
    setEditData(null)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditData(null)
  }

  // ── 未登录：显示登录页 ──
  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800 leading-tight">AX爬宠繁育基地</div>
              <div className="text-[10px] text-gray-400 leading-tight">记账明细系统</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              概览
            </button>
            <button
              onClick={() => setActiveTab("detail")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "detail"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              明细
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "report"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              报表
            </button>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setFormOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              新增账目
            </Button>

            {/* 更多操作下拉 */}
            <div className="relative group">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="更多操作"
              >
                <span className="flex flex-col gap-[3px] items-center">
                  <span className="w-1 h-1 rounded-full bg-current" />
                  <span className="w-1 h-1 rounded-full bg-current" />
                  <span className="w-1 h-1 rounded-full bg-current" />
                </span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <button
                  onClick={() => setChangePwdOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                  修改密码
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="pt-14 max-w-5xl mx-auto px-4 py-6">
        {activeTab === "overview" ? (
          <div className="space-y-6">
            {/* 智能快速记账 */}
            <SmartInput onConfirm={addTransaction} />

            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
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
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                数据分析
              </h2>
              <Charts transactions={transactions} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
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
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
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
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => exportTransactionsToExcel(transactions)}
                disabled={transactions.length === 0}
              >
                <Download className="h-3.5 w-3.5" />
                导出 Excel
              </Button>
            </div>
            {/* 智能快速记账 */}
            <div className="mb-5">
              <SmartInput onConfirm={addTransaction} />
            </div>
            <TransactionList
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={deleteTransaction}
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

      {/* 修改密码弹窗 */}
      <ChangePasswordDialog
        open={changePwdOpen}
        onClose={() => setChangePwdOpen(false)}
        onSave={changePassword}
      />

      {/* 退出登录确认 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LogOut className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">确认退出登录？</h3>
            <p className="text-xs text-gray-400 mb-5">退出后需要重新输入密码才能访问</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-sm" onClick={() => setShowLogoutConfirm(false)}>
                取消
              </Button>
              <Button variant="destructive" className="flex-1 text-sm" onClick={handleLogout}>
                确认退出
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

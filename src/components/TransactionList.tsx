import { useState } from "react"
import { Search, Pencil, Trash2, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SelectNative } from "@/components/ui/select-native"
import { Card, CardContent } from "@/components/ui/card"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types"
import type { Transaction } from "@/types"

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const ALL_CATEGORIES = [
  ...INCOME_CATEGORIES.map((c) => ({ ...c, type: "income" })),
  ...EXPENSE_CATEGORIES.map((c) => ({ ...c, type: "expense" })),
]

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterMonth, setFilterMonth] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const PAGE_SIZE = 15

  // 收集所有月份供筛选
  const months = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort().reverse()

  const filtered = transactions.filter((tx) => {
    if (filterType !== "all" && tx.type !== filterType) return false
    if (filterCategory && tx.category !== filterCategory) return false
    if (filterMonth && !tx.date.startsWith(filterMonth)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.notes.toLowerCase().includes(q)
      )
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDelete(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }

  const getCategoryInfo = (name: string) => {
    return ALL_CATEGORIES.find((c) => c.name === name)
  }

  return (
    <div className="space-y-3">
      {/* 搜索栏 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="搜索描述、分类、备注..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5 shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          筛选
          {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {/* 展开筛选项 */}
      {showFilters && (
        <Card className="border-dashed border-gray-200 shadow-none bg-gray-50/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">收支类型</label>
                <SelectNative
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value as "all" | "income" | "expense"); setPage(1) }}
                >
                  <option value="all">全部</option>
                  <option value="income">收入</option>
                  <option value="expense">支出</option>
                </SelectNative>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">分类</label>
                <SelectNative
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
                  placeholder="所有分类"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </SelectNative>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">月份</label>
                <SelectNative
                  value={filterMonth}
                  onChange={(e) => { setFilterMonth(e.target.value); setPage(1) }}
                  placeholder="所有月份"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>{m.replace("-", "年") + "月"}</option>
                  ))}
                </SelectNative>
              </div>
            </div>
            {(filterType !== "all" || filterCategory || filterMonth) && (
              <button
                onClick={() => { setFilterType("all"); setFilterCategory(""); setFilterMonth(""); setPage(1) }}
                className="mt-3 text-xs text-primary hover:underline cursor-pointer"
              >
                清除筛选条件
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 结果统计 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>共 <strong className="text-gray-700">{filtered.length}</strong> 条记录</span>
        {totalPages > 1 && (
          <span>第 {page}/{totalPages} 页</span>
        )}
      </div>

      {/* 列表 */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🦎</div>
          <div className="text-sm">暂无账目记录</div>
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((tx) => {
            const catInfo = getCategoryInfo(tx.category)
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* 图标 */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: (catInfo?.color || "#94a3b8") + "20" }}
                >
                  {catInfo?.icon || "💼"}
                </div>

                {/* 主要信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {tx.description}
                    </span>
                    <Badge
                      variant={tx.type === "income" ? "success" : "destructive"}
                      className="text-xs shrink-0"
                    >
                      {tx.type === "income" ? "收入" : "支出"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{tx.date}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">
                      {tx.category}
                      {tx.subCategory ? ` · ${tx.subCategory}` : ""}
                    </span>
                    {tx.notes && (
                      <>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400 truncate max-w-32">{tx.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 金额 */}
                <div
                  className={`text-base font-bold shrink-0 ${
                    tx.type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}¥{formatAmount(tx.amount)}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(tx)}
                    className="p-1.5 rounded-md hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                    title="编辑"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      confirmDeleteId === tx.id
                        ? "bg-red-100 text-red-600"
                        : "hover:bg-red-50 text-red-300 hover:text-red-500"
                    }`}
                    title={confirmDeleteId === tx.id ? "再次点击确认删除" : "删除"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            上一页
          </Button>
          <span className="flex items-center text-sm text-gray-500 px-3">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}

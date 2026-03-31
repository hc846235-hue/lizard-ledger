import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SelectNative } from "@/components/ui/select-native"
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types"
import type { Transaction, TransactionType } from "@/types"

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Transaction, "id" | "createdAt">) => void
  editData?: Transaction | null
}

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  type: "income" as TransactionType,
  category: "",
  subCategory: "",
  amount: "",
  description: "",
  notes: "",
}

export function TransactionForm({ open, onClose, onSubmit, editData }: TransactionFormProps) {
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date,
        type: editData.type,
        category: editData.category,
        subCategory: editData.subCategory,
        amount: String(editData.amount),
        description: editData.description,
        notes: editData.notes,
      })
    } else {
      setForm({ ...emptyForm })
    }
  }, [editData, open])

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const selectedCategory = categories.find((c) => c.name === form.category)

  const handleTypeChange = (type: TransactionType) => {
    setForm((prev) => ({ ...prev, type, category: "", subCategory: "" }))
  }

  const handleCategoryChange = (category: string) => {
    setForm((prev) => ({ ...prev, category, subCategory: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.date || !form.category || !form.amount || !form.description) return
    onSubmit({
      date: form.date,
      type: form.type,
      category: form.category,
      subCategory: form.subCategory,
      amount: parseFloat(form.amount),
      description: form.description,
      notes: form.notes,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={onClose}>
          <DialogTitle>{editData ? "编辑账目" : "新增账目"}</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* 收入/支出切换 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">类型</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                  form.type === "income"
                    ? "bg-green-500 text-white border-green-500 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                }`}
              >
                + 收入
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                  form.type === "expense"
                    ? "bg-red-500 text-white border-red-500 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                }`}
              >
                - 支出
              </button>
            </div>
          </div>

          {/* 日期 + 金额 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">日期 *</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">金额（元）*</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* 分类 + 子分类 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">分类 *</label>
              <SelectNative
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                placeholder="请选择分类"
                required
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">子分类</label>
              <SelectNative
                value={form.subCategory}
                onChange={(e) => setForm((p) => ({ ...p, subCategory: e.target.value }))}
                placeholder="请选择子分类"
                disabled={!selectedCategory}
              >
                {selectedCategory?.subCategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectNative>
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">描述 *</label>
            <Input
              placeholder="例：出售印尼蓝舌幼体 ×2"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">备注</label>
            <Textarea
              placeholder="选填：相关备注信息"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">
            {editData ? "保存修改" : "添加账目"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

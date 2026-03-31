import { useState, useRef, useCallback } from "react"
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Loader2, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { parseTransactionText, SMART_INPUT_EXAMPLES } from "@/utils/parseTransaction"
import type { ParsedTransaction } from "@/utils/parseTransaction"
import type { Transaction } from "@/types"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types"

interface SmartInputProps {
  onConfirm: (transaction: Omit<Transaction, "id" | "createdAt">) => void
}

export function SmartInput({ onConfirm }: SmartInputProps) {
  const [inputText, setInputText] = useState("")
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [successFlash, setSuccessFlash] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 可编辑的解析结果字段
  const [editAmount, setEditAmount] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editType, setEditType] = useState<"income" | "expense">("income")
  const [editCategory, setEditCategory] = useState("")
  const [editSubCategory, setEditSubCategory] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const handleParse = useCallback(() => {
    if (!inputText.trim()) return
    setIsParsing(true)

    // 模拟一点解析延迟，让体验更顺滑
    setTimeout(() => {
      const result = parseTransactionText(inputText)
      if (result) {
        setParsed(result)
        setEditAmount(result.amount > 0 ? String(result.amount) : "")
        setEditDate(result.date)
        setEditType(result.type)
        setEditCategory(result.category)
        setEditSubCategory(result.subCategory)
        setEditDescription(result.description)
        setShowDetail(true)
      }
      setIsParsing(false)
    }, 300)
  }, [inputText])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleParse()
    }
  }

  const handleConfirm = () => {
    if (!parsed) return
    const amount = parseFloat(editAmount)
    if (!amount || amount <= 0) return

    onConfirm({
      date: editDate,
      type: editType,
      category: editCategory,
      subCategory: editSubCategory,
      amount,
      description: editDescription,
      notes: parsed.notes,
    })

    // 成功闪动
    setSuccessFlash(true)
    setTimeout(() => setSuccessFlash(false), 800)

    // 重置
    setInputText("")
    setParsed(null)
    setShowDetail(false)
  }

  const handleReset = () => {
    setInputText("")
    setParsed(null)
    setShowDetail(false)
  }

  const handleExampleClick = (example: string) => {
    setInputText(example)
    setShowExamples(false)
    // 自动聚焦
    textareaRef.current?.focus()
  }

  // 当类型改变时重置分类
  const handleTypeChange = (newType: "income" | "expense") => {
    setEditType(newType)
    const cats = newType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    setEditCategory(cats[0].name)
    setEditSubCategory(cats[0].subCategories[0])
  }

  // 当主分类改变时重置子分类
  const handleCategoryChange = (catName: string) => {
    setEditCategory(catName)
    const cats = editType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    const cat = cats.find((c) => c.name === catName)
    if (cat) setEditSubCategory(cat.subCategories[0])
  }

  const currentCategories = editType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const currentSubCategories = currentCategories.find((c) => c.name === editCategory)?.subCategories ?? []

  const confidenceColor =
    parsed && parsed.confidence >= 0.7
      ? "text-green-600"
      : parsed && parsed.confidence >= 0.4
      ? "text-yellow-600"
      : "text-red-500"

  const confidenceLabel =
    parsed && parsed.confidence >= 0.7
      ? "高"
      : parsed && parsed.confidence >= 0.4
      ? "中"
      : "低"

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        successFlash
          ? "border-green-400 bg-green-50 shadow-green-100 shadow-lg"
          : "border-gray-200 bg-white shadow-sm hover:shadow-md"
      }`}
    >
      {/* 头部 */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">智能快速记账</p>
          <p className="text-[11px] text-gray-400">用自然语言描述，自动识别账目信息</p>
        </div>
        {parsed && (
          <button
            onClick={handleReset}
            className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            title="重新输入"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 输入区域 */}
      <div className="px-4 pb-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              // 如果用户修改了输入，清除旧解析结果
              if (parsed) {
                setParsed(null)
                setShowDetail(false)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="例：今天卖了2条幼体收了800元（回车解析）"
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
          />
          {inputText && (
            <button
              onClick={() => { setInputText(""); setParsed(null); setShowDetail(false) }}
              className="absolute right-2.5 top-2.5 p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 操作按钮行 */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            onClick={handleParse}
            disabled={!inputText.trim() || isParsing}
            size="sm"
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-sm text-xs px-4 h-7 cursor-pointer"
          >
            {isParsing ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                识别中…
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                解析
              </>
            )}
          </Button>

          <button
            onClick={() => setShowExamples((v) => !v)}
            className="text-xs text-violet-500 hover:text-violet-700 flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            示例参考
            {showExamples ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* 示例列表 */}
        {showExamples && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SMART_INPUT_EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExampleClick(ex)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100 cursor-pointer transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 解析结果区 */}
      {parsed && (
        <div className="border-t border-gray-100 bg-gray-50/80">
          {/* 结果摘要行 */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-100/60 transition-colors"
            onClick={() => setShowDetail((v) => !v)}
          >
            {parsed.confidence >= 0.5 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                    editType === "income"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {editType === "income" ? "收入" : "支出"}
                </span>
                <span className="text-sm font-bold text-gray-800">
                  ¥{editAmount || "—"}
                </span>
                <span className="text-xs text-gray-500">{editCategory}</span>
                <span className="text-[11px] text-gray-400">{editDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-medium ${confidenceColor}`}>
                置信度{confidenceLabel}
              </span>
              {showDetail ? (
                <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              )}
            </div>
          </div>

          {/* 可编辑详情 */}
          {showDetail && (
            <div className="px-4 pb-4 space-y-3">
              {/* 识别依据 */}
              {parsed.hints.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {parsed.hints.map((hint, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-500 border border-violet-100 rounded-full">
                      {hint}
                    </span>
                  ))}
                </div>
              )}

              {/* 字段网格 */}
              <div className="grid grid-cols-2 gap-3">
                {/* 日期 */}
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">日期</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-violet-400"
                  />
                </div>

                {/* 金额 */}
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">金额（元）</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="请输入金额"
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-violet-400"
                  />
                </div>

                {/* 类型 */}
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">类型</label>
                  <div className="flex gap-1">
                    {(["income", "expense"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={`flex-1 text-xs py-1.5 rounded-lg border transition-all cursor-pointer ${
                          editType === t
                            ? t === "income"
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-red-500 text-white border-red-500"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {t === "income" ? "收入" : "支出"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 主分类 */}
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">分类</label>
                  <select
                    value={editCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-violet-400 cursor-pointer"
                  >
                    {currentCategories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 子分类 */}
                <div className="col-span-2">
                  <label className="text-[11px] text-gray-500 mb-1 block">子分类</label>
                  <select
                    value={editSubCategory}
                    onChange={(e) => setEditSubCategory(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-violet-400 cursor-pointer"
                  >
                    {currentSubCategories.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* 描述 */}
                <div className="col-span-2">
                  <label className="text-[11px] text-gray-500 mb-1 block">描述</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="账目描述"
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-violet-400"
                  />
                </div>
              </div>

              {/* 确认按钮 */}
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleConfirm}
                  disabled={!editAmount || parseFloat(editAmount) <= 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 h-8 text-xs cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  确认新增
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="h-8 text-xs px-3 cursor-pointer"
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

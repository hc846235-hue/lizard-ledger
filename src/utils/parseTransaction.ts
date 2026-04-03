import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types"
import type { TransactionType } from "@/types"

export interface ParsedTransaction {
  date: string
  type: TransactionType
  category: string
  subCategory: string
  amount: number
  description: string
  notes: string
  confidence: number // 0-1，解析置信度
  hints: string[]    // 解析依据说明
}

// ─── 关键词映射 ────────────────────────────────────────────────

const INCOME_KEYWORDS = [
  "卖", "售出", "出售", "销售", "收入", "收到", "到账", "打款", "付款给我",
  "收款", "入账", "盈利", "代繁", "寄养费", "配对费", "打赏", "课程",
  "转让", "出", "卖掉"
]

const EXPENSE_KEYWORDS = [
  "买", "购", "花", "支出", "支付", "付款", "扣款", "消费", "进货",
  "引种", "饲料", "蟋蟀", "杜比亚", "蔬菜", "钙粉", "维生素",
  "设备", "饲养箱", "爬柜", "加热", "灯", "温控", "器材",
  "医疗", "兽医", "门诊", "手术", "药", "检测",
  "房租", "水电", "快递", "包装", "广告", "推广",
  "工资", "薪资", "用工", "奖金", "提成",
  "运费", "交通", "通讯", "办公"
]

// 分类关键词映射：关键词 → [type, category, subCategory]
const CATEGORY_MAP: Array<{
  keywords: string[]
  type: TransactionType
  category: string
  subCategory: string
}> = [
  // 收入分类
  { keywords: ["幼体", "宝宝", "bb", "小苗"], type: "income", category: "蓝舌销售", subCategory: "幼体出售" },
  { keywords: ["亚成", "亚成体"], type: "income", category: "蓝舌销售", subCategory: "亚成体出售" },
  { keywords: ["成体", "成年"], type: "income", category: "蓝舌销售", subCategory: "成体出售" },
  { keywords: ["繁殖对", "一对", "公母对"], type: "income", category: "蓝舌销售", subCategory: "繁殖对出售" },
  { keywords: ["特殊", "变异", "白化", "蓝化", "雪花"], type: "income", category: "蓝舌销售", subCategory: "特殊个体出售" },
  { keywords: ["蓝舌", "石龙子", "北方蓝舌", "东方蓝舌", "印尼蓝舌"], type: "income", category: "蓝舌销售", subCategory: "成体出售" },
  { keywords: ["代繁", "代为繁殖"], type: "income", category: "繁育服务", subCategory: "代繁服务" },
  { keywords: ["寄养"], type: "income", category: "繁育服务", subCategory: "寄养费" },
  { keywords: ["配对服务", "配种服务"], type: "income", category: "繁育服务", subCategory: "配对服务费" },
  { keywords: ["饲料转让", "转让饲料"], type: "income", category: "其他收入", subCategory: "饲料转让" },
  { keywords: ["配件", "出售配件", "转让配件"], type: "income", category: "其他收入", subCategory: "配件出售" },
  { keywords: ["直播打赏", "打赏", "礼物"], type: "income", category: "其他收入", subCategory: "直播打赏" },
  { keywords: ["课程", "教程", "培训"], type: "income", category: "其他收入", subCategory: "课程收入" },
  // 支出分类
  { keywords: ["国内引种", "国内购买"], type: "expense", category: "引种成本", subCategory: "国内引种" },
  { keywords: ["进口", "国外引种", "cbr", "进口引种"], type: "expense", category: "引种成本", subCategory: "进口引种" },
  { keywords: ["买了一对", "购入繁殖对", "买繁殖对"], type: "expense", category: "引种成本", subCategory: "繁殖对购买" },
  { keywords: ["蟋蟀", "杜比亚", "活食", "面包虫", "金凤虫"], type: "expense", category: "饲料饲养", subCategory: "活食（蟋蟀/杜比亚）" },
  { keywords: ["蔬菜", "水果", "南瓜", "西葫芦"], type: "expense", category: "饲料饲养", subCategory: "蔬菜水果" },
  { keywords: ["钙粉", "维生素", "d3", "补钙", "营养品"], type: "expense", category: "饲料饲养", subCategory: "钙粉/维生素" },
  { keywords: ["饲料运费", "快递费"], type: "expense", category: "饲料饲养", subCategory: "饲料运费" },
  { keywords: ["饲养箱", "爬柜", "terrarium"], type: "expense", category: "设备器材", subCategory: "饲养箱/爬柜" },
  { keywords: ["加热", "加热垫", "加热灯", "ptc", "陶瓷灯"], type: "expense", category: "设备器材", subCategory: "加热设备" },
  { keywords: ["uvb", "补光灯", "太阳灯", "日光灯"], type: "expense", category: "设备器材", subCategory: "灯具（UVB/补光）" },
  { keywords: ["温控", "温控器", "温度计"], type: "expense", category: "设备器材", subCategory: "温控设备" },
  { keywords: ["消毒", "消毒液", "杀菌"], type: "expense", category: "设备器材", subCategory: "消毒设备" },
  { keywords: ["兽医", "看病", "就医", "动物医院"], type: "expense", category: "兽医医疗", subCategory: "门诊费" },
  { keywords: ["手术", "开刀"], type: "expense", category: "兽医医疗", subCategory: "手术费" },
  { keywords: ["药", "药品", "驱虫药", "抗生素"], type: "expense", category: "兽医医疗", subCategory: "药品费" },
  { keywords: ["检测", "化验", "血检", "粪检"], type: "expense", category: "兽医医疗", subCategory: "检测费" },
  { keywords: ["房租", "场地", "租金"], type: "expense", category: "运营费用", subCategory: "房租/场地" },
  { keywords: ["水电", "水费", "电费", "电"], type: "expense", category: "运营费用", subCategory: "水电费" },
  { keywords: ["快递", "包装盒", "包装袋", "打包"], type: "expense", category: "运营费用", subCategory: "快递包装" },
  { keywords: ["平台费", "服务费", "手续费"], type: "expense", category: "运营费用", subCategory: "平台服务费" },
  { keywords: ["广告", "推广", "投流"], type: "expense", category: "运营费用", subCategory: "广告推广" },
  { keywords: ["直播设备", "摄像头", "麦克风", "补光灯直播"], type: "expense", category: "运营费用", subCategory: "直播设备" },
  { keywords: ["工资", "薪资", "薪水", "月薪"], type: "expense", category: "人员薪资", subCategory: "员工工资" },
  { keywords: ["临时工", "临时用工", "帮工"], type: "expense", category: "人员薪资", subCategory: "临时用工" },
  { keywords: ["提成", "奖金", "绩效"], type: "expense", category: "人员薪资", subCategory: "提成奖金" },
  { keywords: ["交通", "油费", "停车", "高速"], type: "expense", category: "其他支出", subCategory: "交通出行" },
  { keywords: ["通讯", "话费", "网费", "流量"], type: "expense", category: "其他支出", subCategory: "通讯费" },
  { keywords: ["办公", "文具", "纸", "打印"], type: "expense", category: "其他支出", subCategory: "办公用品" },
]

// ─── 日期解析 ──────────────────────────────────────────────────

function parseDate(text: string): string {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, "0")
  const dd = String(today.getDate()).padStart(2, "0")

  if (/今天|今日/.test(text)) {
    return `${yyyy}-${mm}-${dd}`
  }
  if (/昨天|昨日/.test(text)) {
    const d = new Date(today)
    d.setDate(d.getDate() - 1)
    return d.toISOString().split("T")[0]
  }
  if (/前天/.test(text)) {
    const d = new Date(today)
    d.setDate(d.getDate() - 2)
    return d.toISOString().split("T")[0]
  }
  if (/上周|上星期/.test(text)) {
    const d = new Date(today)
    d.setDate(d.getDate() - 7)
    return d.toISOString().split("T")[0]
  }

  // 匹配 "X月Y日" 或 "X/Y" 或 "X-Y"
  const mDayMatch = text.match(/(\d{1,2})月(\d{1,2})(?:日|号)?/)
  if (mDayMatch) {
    const m = String(mDayMatch[1]).padStart(2, "0")
    const d = String(mDayMatch[2]).padStart(2, "0")
    return `${yyyy}-${m}-${d}`
  }

  // 匹配完整日期 yyyy-mm-dd 或 yyyy/mm/dd
  const fullDateMatch = text.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (fullDateMatch) {
    const y = fullDateMatch[1]
    const m = String(fullDateMatch[2]).padStart(2, "0")
    const d = String(fullDateMatch[3]).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  // 默认今天
  return `${yyyy}-${mm}-${dd}`
}

// ─── 金额解析 ──────────────────────────────────────────────────

function parseAmount(text: string): number {
  // 匹配 "X万" 或 "X.X万"
  const wanMatch = text.match(/(\d+(?:\.\d+)?)\s*万/)
  if (wanMatch) return parseFloat(wanMatch[1]) * 10000

  // 匹配所有数字，包括带单位的金额：800元、800块、¥800、800rmb、收了800、花了800
  // 优先匹配更大的数字(避免误识别数量)
  const amounts: number[] = []
  let match

  // 匹配：收了/卖了/花了/收入/支出 后面跟着数字
  const actionMatch = text.match(/(?:收了|卖了|花了|收入|支出|到账|付款|付款给|支付|花费)(?:\s*\d+[条个对只头])?\s*(\d+(?:[.,]\d+)?)/gi)
  if (actionMatch) {
    const numMatch = actionMatch[0].match(/(\d+(?:[.,]\d+)?)/)
    if (numMatch) amounts.push(parseFloat(numMatch[1].replace(",", "")))
  }

  // 匹配所有带单位的金额，返回所有匹配结果
  const unitMatches = text.matchAll(/[¥￥]?\s*(\d+(?:[.,]\d+)?)\s*(?:元|块|rmb|RMB|cny|CNY)?/g)
  if (unitMatches) {
    for (const m of unitMatches) {
      const num = parseFloat(m[1].replace(",", ""))
      if (!isNaN(num) && num > 0) amounts.push(num)
    }
  }

  // 返回最大的金额(避免误识别数量)
  if (amounts.length > 0) {
    return Math.max(...amounts)
  }

  return 0
}

// ─── 主解析函数 ────────────────────────────────────────────────

export function parseTransactionText(text: string): ParsedTransaction | null {
  if (!text.trim()) return null

  const hints: string[] = []
  let confidence = 0

  // 1. 解析日期
  const date = parseDate(text)
  if (/今天|昨天|前天|上周|\d+月\d+|\d{4}[/-]\d/.test(text)) {
    hints.push("识别到日期信息")
    confidence += 0.15
  }

  // 2. 解析金额
  const amount = parseAmount(text)
  if (amount > 0) {
    hints.push(`金额：${amount.toFixed(2)} 元`)
    confidence += 0.3
  }

  // 3. 判断收支类型
  let type: TransactionType = "income"
  let typeScore = { income: 0, expense: 0 }

  for (const kw of INCOME_KEYWORDS) {
    if (text.includes(kw)) typeScore.income++
  }
  for (const kw of EXPENSE_KEYWORDS) {
    if (text.includes(kw)) typeScore.expense++
  }

  if (typeScore.expense > typeScore.income) {
    type = "expense"
    hints.push("识别为支出")
  } else if (typeScore.income > 0) {
    type = "income"
    hints.push("识别为收入")
  } else {
    hints.push("默认识别为收入（未明确方向）")
  }
  confidence += 0.2

  // 4. 匹配分类
  let matchedCategory = ""
  let matchedSubCategory = ""
  let bestMatchScore = 0

  for (const mapping of CATEGORY_MAP) {
    if (mapping.type !== type) continue
    for (const kw of mapping.keywords) {
      if (text.toLowerCase().includes(kw.toLowerCase())) {
        const score = kw.length // 关键词越长优先级越高
        if (score > bestMatchScore) {
          bestMatchScore = score
          matchedCategory = mapping.category
          matchedSubCategory = mapping.subCategory
        }
      }
    }
  }

  // 如果没匹配到具体分类，使用默认
  if (!matchedCategory) {
    if (type === "income") {
      matchedCategory = INCOME_CATEGORIES[0].name
      matchedSubCategory = INCOME_CATEGORIES[0].subCategories[0]
      hints.push("未能精确匹配分类，使用默认")
    } else {
      matchedCategory = EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1].name
      matchedSubCategory = EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1].subCategories[3]
      hints.push("未能精确匹配分类，使用默认")
    }
  } else {
    hints.push(`匹配分类：${matchedCategory} > ${matchedSubCategory}`)
    confidence += 0.25
  }

  // 5. 提取描述（保留完整的原文作为描述，方便用户确认）
  let description = text.trim()

  // 如果描述太长(超过50字)，才尝试简化
  if (description.length > 50) {
    description = text
      .replace(/[¥￥]\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*(?:万|元|块|rmb|RMB)/gi, "")
      .replace(/今天|昨天|前天|上周|今日|昨日/g, "")
      .replace(/\d{1,2}月\d{1,2}(?:日|号)?/g, "")
      .replace(/\d{4}[/-]\d{1,2}[/-]\d{1,2}/g, "")
      .replace(/[，。！？,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  // 置信度上限
  confidence = Math.min(confidence, 0.95)

  return {
    date,
    type,
    category: matchedCategory,
    subCategory: matchedSubCategory,
    amount,
    description,
    notes: "",
    confidence,
    hints,
  }
}

// ─── 示例输入提示 ──────────────────────────────────────────────

export const SMART_INPUT_EXAMPLES = [
  "今天卖了2条幼体收了800元",
  "昨天买蟋蟀花了150块",
  "3月10日代繁服务费2000元",
  "买了新的UVB灯600元",
  "卖了一对繁殖对5000元",
  "今天电费280元",
  "幼体出售收入1200",
  "进口引种花了8000",
]

export type TransactionType = "income" | "expense"

export interface Transaction {
  id: string
  date: string
  type: TransactionType
  category: string
  subCategory: string
  amount: number
  description: string
  notes: string
  createdAt: string
}

export interface Category {
  name: string
  subCategories: string[]
  color: string
  icon: string
}

export const INCOME_CATEGORIES: Category[] = [
  {
    name: "蓝舌销售",
    subCategories: ["幼体出售", "亚成体出售", "成体出售", "繁殖对出售", "特殊个体出售"],
    color: "#22c55e",
    icon: "🦎",
  },
  {
    name: "繁育服务",
    subCategories: ["代繁服务", "寄养费", "配对服务费"],
    color: "#16a34a",
    icon: "🐣",
  },
  {
    name: "其他收入",
    subCategories: ["饲料转让", "配件出售", "直播打赏", "课程收入"],
    color: "#4ade80",
    icon: "💰",
  },
]

export const EXPENSE_CATEGORIES: Category[] = [
  {
    name: "引种成本",
    subCategories: ["国内引种", "进口引种", "繁殖对购买", "特殊个体采购"],
    color: "#ef4444",
    icon: "🛒",
  },
  {
    name: "饲料饲养",
    subCategories: ["活食（蟋蟀/杜比亚）", "蔬菜水果", "钙粉/维生素", "饲料运费"],
    color: "#f97316",
    icon: "🌿",
  },
  {
    name: "设备器材",
    subCategories: ["爬柜", "消毒用品", "垫材", "水盆", "碗", "瓦楞纸", "木屑", "其他器材"],
    color: "#eab308",
    icon: "🔧",
  },
  {
    name: "兽医医疗",
    subCategories: ["门诊费", "手术费", "药品费", "检测费"],
    color: "#06b6d4",
    icon: "🏥",
  },
  {
    name: "运营费用",
    subCategories: ["房租/场地", "水电费", "快递包装", "平台服务费", "广告推广", "直播设备"],
    color: "#8b5cf6",
    icon: "🏢",
  },
  {
    name: "人员薪资",
    subCategories: ["员工工资", "临时用工", "提成奖金"],
    color: "#ec4899",
    icon: "👤",
  },
  {
    name: "其他支出",
    subCategories: ["交通出行", "通讯费", "办公用品", "杂项支出"],
    color: "#94a3b8",
    icon: "📦",
  },
]

export const ALL_CATEGORIES = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES,
}

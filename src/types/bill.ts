/**
 * 账单数据类型定义
 * 用于账单管理系统的数据模型
 */

/**
 * 账单类型
 */
export type BillType = 'expense' | 'income';

/**
 * 账单分类
 */
export type BillCategory =
  | 'food'        // 餐饮
  | 'transport'   // 交通
  | 'shopping'    // 购物
  | 'entertainment' // 娱乐
  | 'housing'     // 居住
  | 'medical'     // 医疗
  | 'education'   // 教育
  | 'other';      // 其他

/**
 * 收入分类
 */
export type IncomeCategory =
  | 'salary'      // 工资
  | 'bonus'       // 奖金
  | 'investment'  // 投资
  | 'parttime'    // 兼职
  | 'other';      // 其他

/**
 * 账单数据模型
 */
export interface Bill {
  _id?: string;              // CloudBase 自动生成的文档 ID
  type: BillType;            // 账单类型: 支出/收入
  amount: number;            // 金额
  category: BillCategory | IncomeCategory; // 分类
  description: string;       // 描述
  date: string;              // 日期 (ISO 8601 格式)
  userId: string;            // 用户 ID
  createdAt?: string;       // 创建时间
  updatedAt?: string;       // 更新时间
}

/**
 * 创建账单的输入类型
 */
export interface CreateBillInput {
  type: BillType;
  amount: number;
  category: BillCategory | IncomeCategory;
  description: string;
  date: string;
  userId: string;
}

/**
 * 更新账单的输入类型
 */
export interface UpdateBillInput {
  amount?: number;
  category?: BillCategory | IncomeCategory;
  description?: string;
  date?: string;
}

/**
 * 账单查询过滤器
 */
export interface BillFilter {
  userId?: string;
  type?: BillType;
  category?: BillCategory | IncomeCategory;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * 账单统计
 */
export interface BillStatistics {
  total: number;             // 总金额
  count: number;             // 笔数
  byCategory: Record<string, number>; // 按分类统计
  byDate: Record<string, number>;     // 按日期统计
}

/**
 * 支出分类选项
 */
export const EXPENSE_CATEGORIES: BillCategory[] = [
  'food',
  'transport',
  'shopping',
  'entertainment',
  'housing',
  'medical',
  'education',
  'other',
];

/**
 * 收入分类选项
 */
export const INCOME_CATEGORIES: IncomeCategory[] = [
  'salary',
  'bonus',
  'investment',
  'parttime',
  'other',
];

/**
 * 分类显示名称映射
 */
export const CATEGORY_NAMES: Record<string, string> = {
  food: '餐饮',
  transport: '交通',
  shopping: '购物',
  entertainment: '娱乐',
  housing: '居住',
  medical: '医疗',
  education: '教育',
  other: '其他',
  salary: '工资',
  bonus: '奖金',
  investment: '投资',
  parttime: '兼职',
};

/**
 * 获取分类显示名称
 */
export function getCategoryName(category: string): string {
  return CATEGORY_NAMES[category] || category;
}

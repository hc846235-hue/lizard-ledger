/**
 * 账单数据服务
 * 提供账单的 CRUD 操作和统计功能
 */

import { getDatabase } from './index';
import type {
  Bill,
  CreateBillInput,
  UpdateBillInput,
  BillFilter,
  BillStatistics,
} from '@/types/bill';

const COLLECTION_NAME = 'bills';

/**
 * 获取命令运算符
 */
function getCommand() {
  const db = getDatabase();
  return db.command;
}

/**
 * 创建账单
 */
export async function createBill(input: CreateBillInput): Promise<Bill> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    const billData: Omit<Bill, '_id'> = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(COLLECTION_NAME).add(billData);

    // 检查返回值是否有错误
    if (typeof result.code === 'string') {
      throw new Error(`创建账单失败: ${result.message || result.code}`);
    }

    // 返回完整的账单数据
    return {
      _id: result.id,
      ...billData,
    };
  } catch (error) {
    console.error('创建账单失败:', error);
    throw new Error(`创建账单失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 获取单个账单
 */
export async function getBillById(billId: string): Promise<Bill | null> {
  try {
    const db = getDatabase();
    const result = await db.collection(COLLECTION_NAME).doc(billId).get();

    if (typeof result.code === 'string') {
      throw new Error(`获取账单失败: ${result.message || result.code}`);
    }

    if (!result.data || result.data.length === 0) {
      return null;
    }

    return result.data[0];
  } catch (error) {
    console.error('获取账单失败:', error);
    throw new Error(`获取账单失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 查询账单列表
 */
export async function getBills(
  filter?: BillFilter,
  options?: {
    limit?: number;
    skip?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }
): Promise<Bill[]> {
  try {
    const db = getDatabase();
    const _ = getCommand();
    let query = db.collection(COLLECTION_NAME);

    // 应用过滤器
    if (filter) {
      const conditions: any = {};

      if (filter.type) {
        conditions.type = filter.type;
      }

      if (filter.category) {
        conditions.category = filter.category;
      }

      if (filter.startDate || filter.endDate) {
        const dateCondition: any = {};
        if (filter.startDate) {
          dateCondition.$gte = filter.startDate;
        }
        if (filter.endDate) {
          dateCondition.$lte = filter.endDate;
        }
        conditions.date = dateCondition;
      }

      if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
        const amountCondition: any = {};
        if (filter.minAmount !== undefined) {
          amountCondition.$gte = filter.minAmount;
        }
        if (filter.maxAmount !== undefined) {
          amountCondition.$lte = filter.maxAmount;
        }
        conditions.amount = amountCondition;
      }

      if (Object.keys(conditions).length > 0) {
        query = query.where(conditions);
      }
    }

    // 排序
    const orderBy = options?.orderBy || 'date';
    const orderDirection = options?.orderDirection || 'desc';
    query = query.orderBy(orderBy, orderDirection);

    // 分页
    const limit = options?.limit || 100;
    const skip = options?.skip || 0;
    query = query.limit(limit).skip(skip);

    const result = await query.get();

    if (typeof result.code === 'string') {
      throw new Error(`查询账单失败: ${result.message || result.code}`);
    }

    return result.data || [];
  } catch (error) {
    console.error('查询账单失败:', error);
    throw new Error(`查询账单失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 更新账单
 */
export async function updateBill(
  billId: string,
  input: UpdateBillInput
): Promise<Bill | null> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    const updateData = {
      ...input,
      updatedAt: now,
    };

    const result = await db
      .collection(COLLECTION_NAME)
      .doc(billId)
      .update(updateData);

    if (typeof result.code === 'string') {
      throw new Error(`更新账单失败: ${result.message || result.code}`);
    }

    // 返回更新后的账单
    return await getBillById(billId);
  } catch (error) {
    console.error('更新账单失败:', error);
    throw new Error(`更新账单失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 删除账单
 */
export async function deleteBill(billId: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.collection(COLLECTION_NAME).doc(billId).remove();

    if (typeof result.code === 'string') {
      throw new Error(`删除账单失败: ${result.message || result.code}`);
    }

    return true;
  } catch (error) {
    console.error('删除账单失败:', error);
    throw new Error(`删除账单失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 批量删除账单
 */
export async function deleteBills(billIds: string[]): Promise<boolean> {
  try {
    const db = getDatabase();

    // CloudBase 不支持批量删除,需要逐个删除
    for (const billId of billIds) {
      await db.collection(COLLECTION_NAME).doc(billId).remove();
    }

    return true;
  } catch (error) {
    console.error('批量删除账单失败:', error);
    throw new Error(`批量删除账单失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 统计账单数据
 */
export async function getBillStatistics(
  filter?: BillFilter
): Promise<BillStatistics> {
  try {
    const bills = await getBills(filter, { limit: 1000 });

    const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const count = bills.length;

    const byCategory: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    bills.forEach((bill) => {
      // 按分类统计
      const categoryKey = bill.type === 'expense' ? `expense_${bill.category}` : `income_${bill.category}`;
      byCategory[categoryKey] = (byCategory[categoryKey] || 0) + bill.amount;

      // 按日期统计 (只取日期部分)
      const dateKey = bill.date.split('T')[0];
      byDate[dateKey] = (byDate[dateKey] || 0) + bill.amount;
    });

    return {
      total,
      count,
      byCategory,
      byDate,
    };
  } catch (error) {
    console.error('统计账单失败:', error);
    throw new Error(`统计账单失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 按日期范围查询账单
 */
export async function getBillsByDateRange(
  startDate: string,
  endDate: string,
  type?: BillType
): Promise<Bill[]> {
  return getBills(
    {
      startDate,
      endDate,
      type,
    },
    {
      orderBy: 'date',
      orderDirection: 'desc',
    }
  );
}

/**
 * 获取最近的账单
 */
export async function getRecentBills(
  userId: string,
  limit: number = 10
): Promise<Bill[]> {
  return getBills(
    { userId: userId as any },
    {
      limit,
      orderBy: 'date',
      orderDirection: 'desc',
    }
  );
}

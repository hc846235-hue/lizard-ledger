import { db } from './cloudbase';

export interface Bill {
  _id?: string;
  date: string; // YYYY-MM-DD
  category: string;
  amount: number;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION_NAME = 'bills';

/**
 * 初始化数据库集合
 */
export async function initDatabase() {
  try {
    // 检查集合是否存在
    const { data } = await db.collection(COLLECTION_NAME).get();
    console.log('数据库集合已存在:', COLLECTION_NAME);
  } catch (error) {
    // 如果集合不存在，创建它
    await db.createCollection(COLLECTION_NAME);
    console.log('创建数据库集合:', COLLECTION_NAME);
  }
}

/**
 * 获取所有账单
 */
export async function getBills(): Promise<Bill[]> {
  try {
    console.log('开始从云端获取账单...');
    const result = await db.collection(COLLECTION_NAME).get();
    console.log('获取账单成功，结果:', result);
    return result.data as Bill[];
  } catch (error) {
    console.error('获取账单失败:', error);
    return [];
  }
}

/**
 * 添加账单
 */
export async function addBill(bill: Omit<Bill, '_id' | 'createdAt' | 'updatedAt'>): Promise<Bill> {
  try {
    const newBill = {
      ...bill,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('准备添加账单到数据库:', newBill);

    const result = await db.collection(COLLECTION_NAME).add(newBill);
    console.log('数据库添加成功，返回结果:', result);

    // CloudBase add 方法返回 { id, requestId }
    const insertedId = (result as any).id || result?._id;
    console.log('文档ID:', insertedId);

    return { ...newBill, _id: insertedId };
  } catch (error) {
    console.error('添加账单失败:', error);
    throw error;
  }
}

/**
 * 更新账单
 */
export async function updateBill(id: string, bill: Partial<Bill>): Promise<Bill> {
  try {
    const updatedBill = {
      ...bill,
      updatedAt: new Date().toISOString(),
    };
    console.log('准备更新账单，ID:', id, '数据:', updatedBill);
    await db.collection(COLLECTION_NAME).doc(id).update(updatedBill);
    console.log('账单更新成功');
    return { ...updatedBill, _id: id };
  } catch (error) {
    console.error('更新账单失败:', error);
    throw error;
  }
}

/**
 * 删除账单
 */
export async function deleteBill(id: string): Promise<void> {
  try {
    console.log('准备删除账单，ID:', id);
    await db.collection(COLLECTION_NAME).doc(id).remove();
    console.log('账单删除成功');
  } catch (error) {
    console.error('删除账单失败:', error);
    throw error;
  }
}

/**
 * 按日期范围获取账单
 */
export async function getBillsByDateRange(startDate: string, endDate: string): Promise<Bill[]> {
  try {
    const { data } = await db
      .collection(COLLECTION_NAME)
      .where({
        date: db.command.gte(startDate).and(db.command.lte(endDate)),
      })
      .get();
    return data as Bill[];
  } catch (error) {
    console.error('按日期获取账单失败:', error);
    return [];
  }
}

/**
 * 按分类获取账单
 */
export async function getBillsByCategory(category: string): Promise<Bill[]> {
  try {
    const { data } = await db
      .collection(COLLECTION_NAME)
      .where({
        category,
      })
      .get();
    return data as Bill[];
  } catch (error) {
    console.error('按分类获取账单失败:', error);
    return [];
  }
}

/**
 * 导出账单为 Excel 文件
 */
export async function exportBillsToExcel(bills: Bill[]): Promise<Blob> {
  // 动态导入 xlsx 以避免构建时错误
  const XLSX = await import('xlsx');

  // 准备数据（移除 _id、createdAt、updatedAt 字段）
  const exportData = bills.map(({ _id, createdAt, updatedAt, ...rest }) => rest);

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '账单');

  // 生成 Excel 文件
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

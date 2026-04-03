import { airtable, AIRTABLE_TABLE_NAME } from './airtable';

export interface Bill {
  _id?: string;
  date: string; // YYYY-MM-DD
  category: string;
  amount: number;
  note?: string;
  type?: 'income' | 'expense';
  subCategory?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TABLE_NAME = AIRTABLE_TABLE_NAME;

/**
 * 将 Airtable 记录转换为 Bill 对象
 */
function airtableRecordToBill(record: any): Bill {
  const amount = parseFloat(record.get('金额') || record.get('amount') || '0');
  const type = record.get('类型') || record.get('type') || 'expense';

  return {
    _id: record.id,
    date: record.get('日期') || record.get('date') || '',
    category: record.get('分类') || record.get('category') || '',
    amount: (type === 'income' || type === '收入') ? amount : -amount,
    note: record.get('备注') || record.get('note') || '',
    type: type === '收入' ? 'income' : (type === '支出' ? 'expense' : type),
    subCategory: record.get('子分类') || record.get('subCategory') || '',
    createdAt: record.get('创建时间') || record.get('createdAt') || new Date().toISOString(),
    updatedAt: record.get('更新时间') || record.get('updatedAt') || new Date().toISOString(),
  };
}

/**
 * 将 Bill 对象转换为 Airtable 记录数据
 */
function billToAirtableFields(bill: Bill): any {
  return {
    '日期': bill.date,
    '类型': bill.type || (bill.amount >= 0 ? '收入' : '支出'),
    '分类': bill.category,
    '子分类': bill.subCategory || '',
    '金额': Math.abs(bill.amount),
    '备注': bill.note || '',
    '创建时间': bill.createdAt || new Date().toISOString(),
    '更新时间': new Date().toISOString(),
  };
}

/**
 * 初始化数据库（Airtable 不需要初始化）
 */
export async function initDatabase() {
  console.log('Airtable 数据库已就绪');
  console.log('Table Name:', TABLE_NAME);
}

/**
 * 获取所有账单
 */
export async function getBills(): Promise<Bill[]> {
  try {
    console.log('========== 开始从 Airtable 获取账单 ==========');
    console.log('Table Name:', TABLE_NAME);

    const records = await airtable(TABLE_NAME).select().all();
    console.log('获取账单成功，记录数量:', records.length);

    const bills = records.map(airtableRecordToBill);

    if (bills.length > 0) {
      console.log('第一条账单示例:', bills[0]);
    }

    return bills;
  } catch (error: any) {
    console.error('========== 获取账单失败 ==========');
    console.error('错误详情:', error);

    // 检查是否是 API Key 错误
    if (error?.message?.includes('401') || error?.message?.includes('403')) {
      throw new Error('Airtable API Key 无效，请检查环境变量 VITE_AIRTABLE_API_KEY');
    }

    // 检查是否是表名错误
    if (error?.message?.includes('Could not find table')) {
      throw new Error(`找不到表 "${TABLE_NAME}"，请检查 Airtable 中的表名是否正确`);
    }

    // 返回空数组，让应用可以继续运行
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

    console.log('准备添加账单到 Airtable:');
    console.log('- Table Name:', TABLE_NAME);
    console.log('- 数据:', JSON.stringify(newBill, null, 2));

    const fields = billToAirtableFields(newBill as Bill);
    const record = await airtable(TABLE_NAME).create(fields);

    console.log('Airtable 添加成功，记录 ID:', (record as any).id);

    return { ...newBill, _id: (record as any).id };
  } catch (error: any) {
    console.error('添加账单失败:');
    console.error('- 错误信息:', error?.message);
    console.error('- 错误详情:', error);

    // 提供更友好的错误信息
    if (error?.message?.includes('401') || error?.message?.includes('403')) {
      throw new Error('Airtable API Key 无效，请检查环境变量');
    }

    throw new Error(error?.message || '添加账单失败，请稍后重试');
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

    console.log('准备更新账单:');
    console.log('- ID:', id);
    console.log('- 数据:', JSON.stringify(updatedBill, null, 2));

    const fields = billToAirtableFields(updatedBill as Bill);
    const record = await airtable(TABLE_NAME).update(id, fields);

    console.log('账单更新成功');

    const result = airtableRecordToBill(record);
    return result;
  } catch (error: any) {
    console.error('更新账单失败:');
    console.error('- 错误信息:', error?.message);
    console.error('- 记录ID:', id);

    throw new Error(error?.message || '更新账单失败，请稍后重试');
  }
}

/**
 * 删除账单
 */
export async function deleteBill(id: string): Promise<void> {
  try {
    console.log('准备删除账单，ID:', id);

    await airtable(TABLE_NAME).destroy(id);
    console.log('账单删除成功');
  } catch (error: any) {
    console.error('删除账单失败:');
    console.error('- 错误信息:', error?.message);
    console.error('- 记录ID:', id);

    throw new Error(error?.message || '删除账单失败，请稍后重试');
  }
}

/**
 * 按日期范围获取账单
 */
export async function getBillsByDateRange(startDate: string, endDate: string): Promise<Bill[]> {
  try {
    console.log(`获取 ${startDate} 到 ${endDate} 之间的账单`);

    const records = await airtable(TABLE_NAME)
      .select({
        filterByFormula: `AND(
          {日期} >= '${startDate}',
          {日期} <= '${endDate}'
        )`,
      })
      .all();

    console.log(`找到 ${records.length} 条账单`);
    return records.map(airtableRecordToBill);
  } catch (error: any) {
    console.error('按日期获取账单失败:', error);
    return [];
  }
}

/**
 * 按分类获取账单
 */
export async function getBillsByCategory(category: string): Promise<Bill[]> {
  try {
    console.log(`获取分类 "${category}" 的账单`);

    const records = await airtable(TABLE_NAME)
      .select({
        filterByFormula: `{分类} = '${category}'`,
      })
      .all();

    console.log(`找到 ${records.length} 条账单`);
    return records.map(airtableRecordToBill);
  } catch (error: any) {
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

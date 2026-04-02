import { db } from './cloudbase';

export interface Bill {
  _id?: string;
  date: string; // YYYY-MM-DD
  category: string;
  amount: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'bills';

/**
 * 初始化数据库集合
 */
export async function initDatabase() {
  try {
    // 检查集合是否存在
    const { data } = await db.collection(COLLECTION_NAME).get();
    console.log('数据库集合已存在:', COLLECTION_NAME, '文档数量:', data.length);
  } catch (error: any) {
    console.log('尝试创建数据库集合:', COLLECTION_NAME);
    try {
      await db.createCollection(COLLECTION_NAME);
      console.log('创建数据库集合成功:', COLLECTION_NAME);
    } catch (createError: any) {
      console.error('创建数据库集合失败:', createError);
      // 如果集合已存在错误，忽略
      if (createError.code !== 'DATABASE_COLLECTION_EXIST') {
        throw createError;
      }
    }
  }
}

/**
 * 获取所有账单
 */
export async function getBills(): Promise<Bill[]> {
  try {
    console.log('========== 开始从云端获取账单 ==========');

    // 动态导入 auth 实例
    const { auth } = await import('./cloudbase');
    console.log('当前用户信息:', {
      uid: auth.currentUser?.uid,
      openid: auth.currentUser?.openid,
      isAnonymous: auth.currentUser?.isAnonymous,
      loginType: auth.currentUser?.loginType
    });
    console.log('认证状态:', {
      hasUser: !!auth.currentUser,
      isLogin: auth.currentUser?.isLogin,
      isLoginExpired: auth.currentUser?.isLoginExpired
    });

    const result = await db.collection(COLLECTION_NAME).get();
    console.log('获取账单成功，文档数量:', result.data.length);

    if (result.data.length > 0) {
      console.log('第一条账单示例:', result.data[0]);
    }

    return result.data as Bill[];
  } catch (error: any) {
    console.error('========== 获取账单失败 ==========');
    console.error('错误详情:', {
      message: error?.message,
      code: error?.code,
      requestId: error?.requestId,
      fullError: error
    });

    // 如果是权限错误，提示用户
    if (error?.code === 'PERMISSION_DENIED') {
      console.warn('权限被拒绝，请检查 CloudBase 控制台的数据库权限设置');
      throw new Error('没有读取权限，请检查数据库权限设置（需要设置为：auth != null）');
    } else if (error?.code === 'UNAUTHENTICATED') {
      console.warn('用户未登录');
      throw new Error('用户未登录，请重新登录');
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

    // 动态导入 auth 实例
    const { auth } = await import('./cloudbase');

    console.log('准备添加账单到数据库:');
    console.log('- 集合名称:', COLLECTION_NAME);
    console.log('- 数据:', JSON.stringify(newBill, null, 2));
    console.log('- 当前用户:', auth.currentUser?.uid);

    const result = await db.collection(COLLECTION_NAME).add(newBill);
    console.log('数据库添加成功，返回结果:', result);
    console.log('返回值类型:', typeof result);

    // CloudBase add 方法可能返回：
    // 1. 字符串（文档 ID）
    // 2. 对象 { id: 'xxx' }
    // 3. 对象 { _id: 'xxx' }
    let insertedId: string | undefined;

    if (typeof result === 'string') {
      // 返回的是字符串 ID
      insertedId = result;
    } else if (result && typeof result === 'object') {
      // 返回的是对象，尝试获取 id 或 _id
      insertedId = (result as any).id || (result as any)._id;
    }

    console.log('提取的文档ID:', insertedId);

    if (!insertedId) {
      console.error('无法从返回值中提取 ID，完整返回值:', JSON.stringify(result));
      throw new Error('添加账单成功但未返回 ID');
    }

    return { ...newBill, _id: insertedId };
  } catch (error: any) {
    console.error('添加账单失败:');
    console.error('- 错误信息:', error?.message);
    console.error('- 错误代码:', error?.code);
    console.error('- 错误详情:', error);

    // 提供更友好的错误信息
    if (error?.code === 'PERMISSION_DENIED') {
      throw new Error('没有写入权限，请检查数据库权限设置');
    } else if (error?.code === 'UNAUTHENTICATED') {
      throw new Error('用户未登录，请重新登录');
    } else {
      throw new Error(error?.message || '添加账单失败，请稍后重试');
    }
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

    await db.collection(COLLECTION_NAME).doc(id).update(updatedBill);
    console.log('账单更新成功');

    return {
      _id: id,
      date: updatedBill.date || '',
      category: updatedBill.category || '',
      amount: updatedBill.amount || 0,
      note: updatedBill.note,
      createdAt: updatedBill.createdAt,
      updatedAt: updatedBill.updatedAt,
    } as Bill;
  } catch (error: any) {
    console.error('更新账单失败:');
    console.error('- 错误信息:', error?.message);
    console.error('- 错误代码:', error?.code);
    console.error('- 文档ID:', id);

    if (error?.code === 'PERMISSION_DENIED') {
      throw new Error('没有修改权限，请检查数据库权限设置');
    } else if (error?.code === 'DOCUMENT_NOT_EXIST') {
      throw new Error('账单不存在，可能已被删除');
    } else if (error?.code === 'UNAUTHENTICATED') {
      throw new Error('用户未登录，请重新登录');
    } else {
      throw new Error(error?.message || '更新账单失败，请稍后重试');
    }
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
  } catch (error: any) {
    console.error('删除账单失败:');
    console.error('- 错误信息:', error?.message);
    console.error('- 错误代码:', error?.code);
    console.error('- 文档ID:', id);

    if (error?.code === 'PERMISSION_DENIED') {
      throw new Error('没有删除权限，请检查数据库权限设置');
    } else if (error?.code === 'DOCUMENT_NOT_EXIST') {
      throw new Error('账单不存在，可能已被删除');
    } else if (error?.code === 'UNAUTHENTICATED') {
      throw new Error('用户未登录，请重新登录');
    } else {
      throw new Error(error?.message || '删除账单失败，请稍后重试');
    }
  }
}

/**
 * 按日期范围获取账单
 */
export async function getBillsByDateRange(startDate: string, endDate: string): Promise<Bill[]> {
  try {
    console.log(`获取 ${startDate} 到 ${endDate} 之间的账单`);

    const { data } = await db
      .collection(COLLECTION_NAME)
      .where({
        date: db.command.gte(startDate).and(db.command.lte(endDate)),
      })
      .get();

    console.log(`找到 ${data.length} 条账单`);
    return data as Bill[];
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

    const { data } = await db
      .collection(COLLECTION_NAME)
      .where({
        category,
      })
      .get();

    console.log(`找到 ${data.length} 条账单`);
    return data as Bill[];
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

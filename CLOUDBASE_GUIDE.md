# CloudBase 集成使用指南

## 快速开始

### 1. 环境配置

确保 `.env` 文件包含正确的 CloudBase 配置：

```env
VITE_CLOUDBASE_ENV_ID=mm223-7gozbhmt7b381a50
VITE_CLOUDBASE_AUTH=anonymous
```

### 2. SDK 初始化

在应用启动时初始化 CloudBase SDK：

```typescript
import { initCloudbase, anonymousLogin } from '@/lib/cloudbase';

// 必须在应用启动时同步初始化
initCloudbase();

// 执行匿名登录
await anonymousLogin();
```

## 账单操作

### 创建账单

```typescript
import { createBill } from '@/lib/cloudbase/billService';
import type { CreateBillInput } from '@/types/bill';

const input: CreateBillInput = {
  type: 'expense',  // 'expense' | 'income'
  amount: 100,
  category: 'food',  // 分类
  description: '午餐',
  date: '2026-04-01',
  userId: 'user123'
};

const bill = await createBill(input);
console.log('创建成功:', bill);
```

### 查询账单

#### 查询所有账单

```typescript
import { getBills } from '@/lib/cloudbase/billService';

const bills = await getBills();
```

#### 条件查询

```typescript
import { getBills } from '@/lib/cloudbase/billService';
import type { BillFilter } from '@/types/bill';

const filter: BillFilter = {
  type: 'expense',           // 只查支出
  category: 'food',          // 只查餐饮分类
  startDate: '2026-04-01',   // 起始日期
  endDate: '2026-04-30',     // 结束日期
  minAmount: 10,             // 最小金额
  maxAmount: 500             // 最大金额
};

const bills = await getBills(filter);
```

#### 分页查询

```typescript
import { getBills } from '@/lib/cloudbase/billService';

const bills = await getBills(
  filter,  // 可选的过滤条件
  {
    limit: 20,                  // 每页 20 条
    skip: 0,                    // 跳过 0 条（第一页）
    orderBy: 'date',            // 按日期排序
    orderDirection: 'desc'      // 降序（最新的在前）
  }
);
```

#### 查询单个账单

```typescript
import { getBillById } from '@/lib/cloudbase/billService';

const bill = await getBillById('bill_id_here');
```

### 更新账单

```typescript
import { updateBill } from '@/lib/cloudbase/billService';
import type { UpdateBillInput } from '@/types/bill';

const updateData: UpdateBillInput = {
  amount: 150,
  description: '更新后的描述'
};

const updatedBill = await updateBill('bill_id_here', updateData);
```

### 删除账单

```typescript
import { deleteBill } from '@/lib/cloudbase/billService';

await deleteBill('bill_id_here');
```

### 批量删除

```typescript
import { deleteBills } from '@/lib/cloudbase/billService';

const billIds = ['id1', 'id2', 'id3'];
await deleteBills(billIds);
```

## 数据统计

### 基础统计

```typescript
import { getBillStatistics } from '@/lib/cloudbase/billService';

const stats = await getBillStatistics();
console.log('总金额:', stats.total);
console.log('笔数:', stats.count);
console.log('按分类:', stats.byCategory);
console.log('按日期:', stats.byDate);
```

### 条件统计

```typescript
import { getBillStatistics } from '@/lib/cloudbase/billService';

const filter: BillFilter = {
  type: 'expense',
  startDate: '2026-04-01',
  endDate: '2026-04-30'
};

const stats = await getBillStatistics(filter);
```

## 高级功能

### 按日期范围查询

```typescript
import { getBillsByDateRange } from '@/lib/cloudbase/billService';

const bills = await getBillsByDateRange(
  '2026-04-01',  // 起始日期
  '2026-04-30',  // 结束日期
  'expense'      // 可选：账单类型
);
```

### 获取最近的账单

```typescript
import { getRecentBills } from '@/lib/cloudbase/billService';

const recentBills = await getRecentBills('user123', 10);  // 最近 10 笔
```

## 认证管理

### 检查登录状态

```typescript
import { checkLoginStatus } from '@/lib/cloudbase';

const loginState = await checkLoginStatus();
console.log('登录状态:', loginState);
```

### 登出

```typescript
import { logout } from '@/lib/cloudbase';

await logout();
```

## 错误处理

所有数据库操作都应该使用 try-catch 处理错误：

```typescript
import { createBill } from '@/lib/cloudbase/billService';

try {
  const bill = await createBill(input);
  console.log('创建成功:', bill);
} catch (error) {
  console.error('创建失败:', error);
  // 显示友好的错误提示给用户
}
```

## 数据库集合

### bills 集合结构

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| `_id` | string | 自动生成的主键 | 否 |
| `type` | string | 账单类型：expense/income | 是 |
| `amount` | number | 金额 | 是 |
| `category` | string | 分类 | 是 |
| `description` | string | 描述 | 是 |
| `date` | string | 日期（ISO 8601） | 是 |
| `userId` | string | 用户 ID | 是 |
| `createdAt` | string | 创建时间 | 否 |
| `updatedAt` | string | 更新时间 | 否 |

### 分类说明

#### 支出分类 (expense)

- `food` - 餐饮
- `transport` - 交通
- `shopping` - 购物
- `entertainment` - 娱乐
- `housing` - 居住
- `medical` - 医疗
- `education` - 教育
- `other` - 其他

#### 收入分类 (income)

- `salary` - 工资
- `bonus` - 奖金
- `investment` - 投资
- `parttime` - 兼职
- `other` - 其他

## CloudBase 控制台

### 访问地址

https://tcb.cloud.tencent.com/dev?envId=mm223-7gozbhmt7b381a50

### 常用功能

1. **数据库管理**
   - 查看 bills 集合数据
   - 执行数据库查询
   - 监控数据库性能

2. **安全管理**
   - 配置数据库安全规则
   - 管理用户权限
   - 查看访问日志

3. **云函数管理**
   - 部署云函数
   - 查看函数日志
   - 监控函数调用

4. **云存储管理**
   - 管理文件存储
   - 查看存储配额
   - 配置访问权限

## 常见问题

### Q: 如何处理登录失败？

A: 检查以下几点：
1. 环境变量 `VITE_CLOUDBASE_ENV_ID` 是否正确
2. 网络连接是否正常
3. CloudBase 环境是否已启用

### Q: 如何提高查询性能？

A:
1. 创建适当的索引
2. 使用分页避免一次性加载大量数据
3. 只查询需要的字段
4. 使用合适的过滤条件

### Q: 数据如何同步到多个设备？

A: CloudBase 自动处理数据同步，只要使用相同的环境 ID 和用户 ID，数据会自动同步。

### Q: 如何备份数据？

A:
1. CloudBase 提供自动备份功能
2. 可以在控制台导出数据
3. 也可以通过代码定期导出数据

## 最佳实践

1. **类型安全**：始终使用 TypeScript 类型定义
2. **错误处理**：所有数据库操作都应该捕获错误
3. **数据验证**：在发送数据前验证数据格式
4. **性能优化**：使用分页和条件查询
5. **用户体验**：提供加载状态和友好的错误提示

## 相关链接

- [CloudBase 官方文档](https://docs.cloudbase.net/)
- [CloudBase Web SDK 文档](https://docs.cloudbase.net/quick-start/)
- [CloudBase 控制台](https://console.cloud.tencent.com/tcb)

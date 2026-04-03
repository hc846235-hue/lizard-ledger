# Airtable 迁移指南

## 已完成的代码修改

### 1. 安装依赖
已更新 `package.json`，添加了 `airtable` 依赖。

### 2. 创建的新文件
- `src/services/airtable.ts` - Airtable 初始化配置
- `src/services/airtableDb.ts` - Airtable 数据库操作接口
- `.env.example` - 环境变量示例
- `.env` - 环境变量文件（待填写）

### 3. 修改的文件
- `src/hooks/useCloudTransactions.ts` - 从 `db.ts` 改为导入 `airtableDb.ts`
- `package.json` - 添加 `airtable` 依赖

---

## 接下来需要做的操作

### 步骤 1：安装依赖

在项目根目录运行：

```bash
npm install
```

### 步骤 2：在 Airtable 中创建字段

打开你的 Airtable Base（https://airtable.com/appqUhdWDESRx6EAa），添加以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| 日期 | Date | 交易日期 |
| 类型 | Single select | 收入 / 支出 |
| 分类 | Single select | 主分类（如：蓝舌销售、饲料饲养等） |
| 子分类 | Single select | 子分类（如：幼体出售、活食等） |
| 金额 | Number | 交易金额（正数） |
| 备注 | Long text | 可选说明 |
| 创建时间 | Created time | 自动生成 |
| 更新时间 | Last modified time | 自动更新 |

**快捷方式**：
1. 点击表名旁边的「+」
2. 按顺序添加上述字段
3. 对于「类型」字段，设置为 Single select，选项：收入、支出

### 步骤 3：获取 Airtable API Key

1. 访问 https://airtable.com/create/tokens
2. 创建新的 Personal Access Token
3. 权限设置为：
   - ✅ Read data
   - ✅ Edit data
4. 选择你的 Base（lizard-ledger）
5. 复制生成的 API Key

### 步骤 4：配置环境变量

打开项目根目录的 `.env` 文件，填写 API Key：

```bash
VITE_AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXXXX
```

**重要**：
- API Key 以 `pat` 开头
- 不要泄露这个 Key 到公开仓库

### 步骤 5：启动应用测试

```bash
npm run dev
```

浏览器打开 http://localhost:5173，测试：
- ✅ 查看现有账单
- ✅ 添加新账单
- ✅ 编辑账单
- ✅ 删除账单

---

## Airtable 表名说明

当前代码使用的表名是 `网格视图`（Airtable 默认表名）。

**建议**：在 Airtable 中将表名改为 `账单` 或 `Bills`，然后修改代码：

```typescript
// src/services/airtable.ts
const AIRTABLE_TABLE_NAME = '账单'; // 或 'Bills'
```

---

## 数据结构对比

### 原 CloudBase 格式（兼容但已废弃）
```typescript
{
  _id: string,
  date: string,
  category: string,        // "主分类 - 子分类"
  amount: number,           // 收入为正，支出为负
  note: string,
  createdAt: string,
  updatedAt: string,
}
```

### 新 Airtable 格式
```typescript
{
  _id: string,             // Airtable Record ID
  date: string,            // 日期
  type: 'income' | 'expense', // 收入/支出
  category: string,        // 主分类
  subCategory: string,      // 子分类
  amount: number,           // 统一正数
  note: string,
  createdAt: string,
  updatedAt: string,
}
```

---

## 故障排查

### 问题 1：401 Unauthorized 错误

**原因**：API Key 无效或权限不足

**解决**：
1. 检查 `.env` 文件中的 API Key 是否正确
2. 确认 API Key 有读取和写入权限
3. 重新生成 API Key 并更新

### 问题 2：找不到表 "网格视图"

**原因**：表名不匹配

**解决**：
1. 在 Airtable 中查看表名
2. 修改 `src/services/airtable.ts` 中的 `AIRTABLE_TABLE_NAME`

### 问题 3：字段缺失错误

**原因**：Airtable 表中没有对应字段

**解决**：
1. 按照「步骤 2」添加所有必需字段
2. 确保字段名和代码中的中文字段名完全一致

---

## 迁移后清理（可选）

如果想完全移除 CloudBase 依赖：

1. 卸载包：
```bash
npm uninstall @cloudbase/js-sdk
```

2. 删除文件：
- `src/services/cloudbase.ts`
- `src/services/db.ts`

3. 更新 `package.json` 中的 dependencies

---

## 备份建议

在删除 CloudBase 数据之前，建议：

1. 从 CloudBase 导出所有账单数据
2. 导入到 Airtable
3. 确认数据完整后再删除 CloudBase

---

## 技术支持

如有问题，检查：
1. 浏览器控制台的错误日志
2. `.env` 文件是否正确配置
3. Airtable 字段是否完整创建

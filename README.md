# AX爬宠繁育基地 - 记账明细系统

一个现代化的账单管理系统，专为爬宠繁育基地设计，支持多种数据存储方式。

## 功能特性

- ✨ **双数据源支持**
  - 🌐 **云端存储**：使用腾讯云 CloudBase，数据永久保存，支持多设备同步
  - 💾 **本地存储**：使用浏览器 LocalStorage，快速便捷
- 📊 **数据可视化**：直观的图表展示收支情况
- 📋 **智能记账**：自然语言快速记账功能
- 📑 **报表导出**：支持 Excel 导出
- 🔒 **密码保护**：本地密码加密保护

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

**注意**：
- 开发环境使用根路径 `http://localhost:5173/`
- 生产环境（GitHub Pages）使用 `/lizard-ledger/` 路径
- Vite 配置已自动处理两种环境的路径差异

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 云端数据库配置

本项目已配置腾讯云 CloudBase 云数据库：

- **环境 ID**：`mm223-7gozbhmt7b381a50`
- **区域**：上海（ap-shanghai）
- **套餐**：体验版
- **数据库实例**：`tnt-ebr0n2mce`

### 数据库初始化

首次使用云端存储时，系统会自动创建 `bills` 集合。该集合包含以下字段：

```typescript
{
  _id: string;        // 自动生成
  date: string;       // YYYY-MM-DD 格式
  category: string;   // 分类（如"蓝舌销售 - 幼体出售"）
  amount: number;      // 金额
  note: string;       // 备注
  createdAt: Date;    // 创建时间
  updatedAt: Date;    // 更新时间
}
```

### 切换数据源

在应用右上角可以切换"云端"和"本地"数据源：

- **云端**：数据保存在腾讯云数据库，支持多设备访问，数据永久保存
- **本地**：数据保存在浏览器 LocalStorage，刷新页面后数据不会丢失，但清除浏览器缓存会丢失数据

## 项目结构

```
lizard-ledger/
├── src/
│   ├── components/        # React 组件
│   │   ├── StatsCards.tsx       # 统计卡片
│   │   ├── Charts.tsx           # 数据图表
│   │   ├── TransactionForm.tsx  # 记账表单
│   │   ├── TransactionList.tsx  # 账单列表
│   │   ├── LoginScreen.tsx      # 登录界面
│   │   ├── ChangePasswordDialog.tsx # 修改密码
│   │   ├── YearReport.tsx       # 年度报表
│   │   ├── MonthReport.tsx      # 月度报表
│   │   └── SmartInput.tsx      # 智能快速记账
│   ├── hooks/            # React Hooks
│   │   ├── useTransactions.ts       # 本地数据 Hook
│   │   ├── useCloudTransactions.ts  # 云端数据 Hook
│   │   └── useAuth.ts             # 认证 Hook
│   ├── services/         # 服务层
│   │   ├── cloudbase.ts            # CloudBase 初始化
│   │   └── db.ts                   # 数据库操作
│   ├── utils/            # 工具函数
│   │   └── exportExcel.ts          # Excel 导出
│   ├── types.ts          # TypeScript 类型定义
│   └── App.tsx          # 主应用组件
├── public/              # 静态资源
└── package.json         # 项目配置
```

## 技术栈

- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **UI 框架**：Tailwind CSS + shadcn/ui
- **图表库**：Recharts
- **日期处理**：date-fns
- **云数据库**：腾讯云 CloudBase @cloudbase/js-sdk
- **Excel 导出**：xlsx

## 主要功能说明

### 1. 智能快速记账

支持自然语言快速记账，例如：
- "今天买饲料花了 280 元"
- "出售蓝舌幼体收入 3500 元"

### 2. 数据统计

- 总收入、总支出、净利润统计
- 收支占比分析
- 分类汇总
- 趋势图表

### 3. 报表功能

- **年度报表**：按年份汇总收支数据
- **月度报表**：按月份详细展示
- 支持 Excel 导出

### 4. 数据安全

- 本地密码加密
- 云端数据自动备份
- 支持修改密码
- 退出登录保护

## 部署到 GitHub Pages

本项目已配置自动部署到 GitHub Pages。

### 部署配置

- **仓库**：https://github.com/hc846235-hue/lizard-ledger
- **部署地址**：https://hc846235-hue.github.io/lizard-ledger/
- **Vite 配置**：`vite.config.ts` 已设置 `base: "/lizard-ledger/"`

### 自动部署

每次 push 到 `main` 分支会自动触发 GitHub Actions 部署流程。

## CloudBase 环境信息

| 配置项 | 值 |
|--------|-----|
| 环境 ID | mm223-7gozbhmt7b381a50 |
| 别名 | mm223 |
| 区域 | ap-shanghai（上海） |
| 套餐 | baas_trial（体验版） |
| 数据库实例 | tnt-ebr0n2mce |
| 云存储 | 6d6d-mm223-7gozbhmt7b381a50-1302094821 |
| 静态托管 | mm223-7gozbhmt7b381a50-1302094821.tcloudbaseapp.com |

### CloudBase 管理控制台

访问地址：
https://console.cloud.tencent.com/tcb

在控制台中可以：
- 查看数据库内容
- 监控数据库性能
- 管理云函数
- 配置云存储
- 查看日志

## 开发说明

### 本地开发

1. 克隆项目：
```bash
git clone https://github.com/hc846235-hue/lizard-ledger.git
cd lizard-ledger
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

### 添加新功能

- 在 `src/components/` 中添加新组件
- 在 `src/hooks/` 中添加自定义 Hooks
- 在 `src/services/` 中添加服务层逻辑
- 在 `src/types.ts` 中添加类型定义

### 代码规范

- 使用 TypeScript 进行类型检查
- 使用 ESLint 进行代码检查
- 遵循 React Hooks 规则
- 使用 Tailwind CSS 类名进行样式设计

## 常见问题

### Q: 如何切换云端和本地数据？

A: 在应用右上角点击"云端"或"本地"按钮即可切换数据源。

### Q: 云端数据会丢失吗？

A: 不会。云端数据保存在腾讯云数据库中，即使清除浏览器缓存也不会丢失。

### Q: 如何备份数据？

A: 
- 云端数据：自动在腾讯云备份
- 本地数据：可以通过"导出 Excel"功能导出备份

### Q: 如何修改登录密码？

A: 点击右上角"更多操作" → "修改密码"即可。

## License

MIT

## 作者

AX爬宠繁育基地

## 更新日志

### v0.0.1 (2026-04-01)

- ✨ 初始版本发布
- ✨ 支持本地数据存储（LocalStorage）
- ✨ 支持云端数据存储（腾讯云 CloudBase）
- ✨ 智能快速记账功能
- ✨ 数据可视化图表
- ✨ 报表导出功能
- ✨ 密码保护功能

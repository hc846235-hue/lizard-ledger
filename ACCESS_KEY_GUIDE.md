# CloudBase AccessKey 获取指南

## 📋 背景

CloudBase SDK 2.x 版本要求在初始化时提供 `accessKey`（也称为 `publishable key`），否则无法进行匿名登录等认证操作。

## 🔧 获取步骤

### Step 1: 访问 CloudBase 控制台

打开以下链接：
```
https://tcb.cloud.tencent.com/dev?envId=mm223-7gozbhmt7b381a50#/env/apikey
```

### Step 2: 复制 AccessKey（Publishable Key）

1. 在打开的页面中，找到 **"Access Key"** 或 **"Publishable Key"**
2. 点击复制按钮（通常是眼睛图标或复制图标）
3. 复制这个 Key（以 `ak_` 开头的字符串）

### Step 3: 更新代码

将复制的 `accessKey` 添加到 `src/services/cloudbase.ts` 文件中：

```typescript
app = cloudbase.init({
  env: 'mm223-7gozbhmt7b381a50', // 环境 ID
  region: 'ap-shanghai', // 区域（上海）
  accessKey: 'YOUR_ACCESS_KEY_HERE', // ← 粘贴你复制的 accessKey
  auth: { detectSessionInUrl: true }, // 必需：检测 URL 中的会话信息
});
```

### Step 4: 重新构建和部署

```bash
# 1. 安装新版本的 CloudBase SDK
npm install

# 2. 重新构建
npm run build

# 3. 上传到 CloudBase（我会帮你完成这一步）
```

## ✅ 预期结果

完成上述步骤后：

1. ✅ 匿名登录应该成功：`CloudBase 匿名登录成功: {...}`
2. ✅ 用户信息应该有值：`{ uid: "xxx", openid: "xxx", ... }`
3. ✅ 账单可以成功添加到云端数据库
4. ✅ 刷新后数据依然存在（云端持久化）
5. ✅ 不再出现 `PERMISSION_DENIED` 或 `Unauthenticated access is denied` 错误

## 📝 技术说明

### 为什么需要 accessKey？

CloudBase SDK 2.x 引入了更严格的认证机制：

1. **安全增强**：
   - 防止未经授权的应用访问 CloudBase 资源
   - 确保只有经过配置的应用才能使用 CloudBase 能力

2. **环境隔离**：
   - `accessKey` 绑定到特定的 CloudBase 环境
   - 防止跨环境访问和数据泄露

3. **API 兼容性**：
   - CloudBase Auth API（类似 Supabase）
   - 支持多种认证方式（匿名、手机、邮箱、OAuth）

### AccessKey 与 SecretKey 的区别

| 类型 | 用途 | 是否保密 | 使用场景 |
|------|------|---------|---------|
| **Access Key** | 前端 SDK 初始化 | 否（可以公开） | 浏览器/小程序端 |
| **Secret Key** | 服务端/云函数 | 是（必须保密） | Node.js 后端、云函数 |

**重要**：`accessKey` 是可以公开的，不需要保密！

## 🔍 故障排查

### 问题 1：找不到 Access Key

**解决方案**：
1. 确认访问的是正确的控制台页面：
   ```
   https://tcb.cloud.tencent.com/dev?envId=mm223-7gozbhmt7b381a50#/env/apikey
   ```
2. 检查环境 ID 是否正确：`mm223-7gozbhmt7b381a50`
3. 如果页面提示未开启 API Key，点击"新建"或"启用"按钮

### 问题 2：登录仍然失败

**检查控制台日志**：

```
✅ 正确日志：
CloudBase 匿名登录成功: {...}
当前用户信息: { uid: "xxx", openid: "xxx", ... }

❌ 错误日志：
CloudBase 匿名登录失败: TypeError: auth.signInAnonymously is not a function
```

**如果仍然看到 `is not a function` 错误**：
- 检查 `package.json` 中 `@cloudbase/js-sdk` 版本是否为 `^2.24.0` 或更高
- 运行 `npm install` 确保安装了新版本

### 问题 3：权限被拒绝（PERMISSION_DENIED）

**检查数据库安全规则**：

1. 访问 CloudBase 控制台：
   ```
   https://tcb.cloud.tencent.com/dev?envId=mm223-7gozbhmt7b381a50#/db/doc/collection/bills
   ```

2. 检查安全规则是否为：
   ```javascript
   // 所有已登录用户可读
   auth != null
   ```

3. 或者更宽松的规则（仅用于测试）：
   ```javascript
   // 允许所有访问（不推荐生产环境）
   true
   ```

## 📚 参考资料

- [CloudBase Web SDK 文档](https://docs.cloudbase.net/authentication/client/web-sdk)
- [CloudBase Auth API 文档](https://docs.cloudbase.net/authentication/client/supabase-auth)
- [CloudBase 安全规则文档](https://docs.cloudbase.net/database/security-rules)

## 🚀 下一步

1. 按照上述步骤获取 `accessKey`
2. 将 accessKey 添加到 `src/services/cloudbase.ts`
3. 告诉我你已完成，我会帮你重新构建和部署
4. 测试应用，检查控制台日志确认匿名登录成功

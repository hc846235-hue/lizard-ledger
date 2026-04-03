import cloudbase from '@cloudbase/js-sdk';

// 初始化 CloudBase（使用 2.x 版本）
let app: any;
let db: any;
let auth: any;
let isCloudBaseInitialized = false;

try {
  console.log('开始初始化 CloudBase，环境 ID: mm223-7gozbhmt7b381a50');
  app = cloudbase.init({
    env: 'mm223-7gozbhmt7b381a50', // 环境 ID
    region: 'ap-shanghai', // 区域（上海）
    // ✅ 已添加 Publishable Key（从 CloudBase 控制台获取）
    accessKey: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL21tMjIzLTdnb3piaG10N2IzODFhNTAuYXAtc2hhbmdoYWkudGNiLWFwaS50ZW5jZW50Y2xvdWRhcGkuY29tIiwic3ViIjoiYW5vbiIsImF1ZCI6Im1tMjIzLTdnb3piaG10N2IzODFhNTAiLCJleHAiOjQwNzg4MjM2NzUsImlhdCI6MTc3NTE0MDQ3NSwibm9uY2UiOiJjdFVGeTJpcFJjS1VxMFdMeUJwVmhnIiwiYXRfaGFzaCI6ImN0VUZ5MmlwUmNLVXEwV0x5QnBWaGciLCJuYW1lIjoiQW5vbnltb3VzIiwic2NvcGUiOiJhbm9ueW1vdXMiLCJwcm9qZWN0X2lkIjoibW0yMjMtN2dvemJobXQ3YjM4MWE1MCIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.evLfbUFORSoXdRwnNpradJPWmnhd6PY9fqFeGOHDGpGEOtt9LdU7vjuvjLDb6g8q7ra0KWrofl4h-IXKFZPitk-VG_EMIJvYeh0ieagLWBRkIloEinVe4RXjPFvf0IHtzYPCsMlzcE6f-t_vk8hgm-eoI4qO-AmqOaWAO7GVspe_EMbaUdKmwxn7P8_5GhwgZJAhkLbGRtMGG68VqojtAH0kLjqLaTP9D8FM9BGaslvs6bL1qyUpHdKZ9n_9tTdBgnHXAxLQpCfT5WBRB_EeuD_63Lg3X_ILpjnsUm_7i1oob3lZpnn9Bealb_83wcmJoM-ueqhUnAKcKEfbtPk7Jg',
    auth: {
      // ✅ 关键修复：启用持久化登录状态
      persistence: 'local', // 使用 localStorage 持久化登录状态
      detectSessionInUrl: false, // 静态托管不需要检测 URL 中的会话信息
    },
  });

  // 获取数据库引用
  db = app.database();
  console.log('数据库实例创建成功');

  // 获取认证引用
  auth = app.auth({
    persistence: 'local' // 确保使用 localStorage 持久化
  });
  console.log('认证实例创建成功');

  isCloudBaseInitialized = true;
  console.log('CloudBase 初始化成功');
} catch (error: any) {
  console.error('CloudBase 初始化失败:', error);
  console.error('错误详情:', {
    message: error?.message,
    code: error?.code,
    stack: error?.stack
  });

  // 创建模拟的空对象，防止应用崩溃
  db = {
    collection: () => ({
      get: () => Promise.resolve({ data: [] }),
      add: () => Promise.resolve({ id: '' }),
      doc: () => ({
        get: () => Promise.resolve({ data: {} }),
        update: () => Promise.resolve({ updated: 0 }),
        remove: () => Promise.resolve({ deleted: 0 })
      }),
      orderBy: () => ({
        limit: () => ({
          get: () => Promise.resolve({ data: [] })
        })
      }),
      where: () => ({
        get: () => Promise.resolve({ data: [] })
      })
    })
  };

  auth = {
    signInAnonymously: () => Promise.reject(new Error('CloudBase 未初始化，请检查网络连接')),
    currentUser: null,
    getLoginState: () => Promise.resolve({ hasUser: false, isLogin: false })
  };
}

export { db, auth, isCloudBaseInitialized };

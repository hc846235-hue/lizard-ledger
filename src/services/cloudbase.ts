import cloudbase from '@cloudbase/js-sdk';

// 初始化 CloudBase
let app: any;
let db: any;
let auth: any;
let isCloudBaseInitialized = false;

try {
  console.log('开始初始化 CloudBase，环境 ID: mm223-7gozbhmt7b381a50');
  app = cloudbase.init({
    env: 'mm223-7gozbhmt7b381a50', // 环境 ID
  });

  // 获取数据库引用
  db = app.database();
  console.log('数据库实例创建成功');

  // 获取认证引用
  auth = app.auth();
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
    signInWithUsernameAndPassword: () => Promise.reject(new Error('CloudBase 未初始化，请检查网络连接')),
    signUp: () => Promise.reject(new Error('CloudBase 未初始化，请检查网络连接')),
    signOut: () => Promise.resolve(),
    signInAnonymously: () => Promise.reject(new Error('CloudBase 未初始化，请检查网络连接')),
    currentUser: null,
    anonymousAuthProvider: () => ({
      signIn: () => Promise.reject(new Error('CloudBase 未初始化，请检查网络连接'))
    }),
    getLoginState: () => Promise.reject(new Error('CloudBase 未初始化'))
  };
}

export { db, auth, isCloudBaseInitialized };

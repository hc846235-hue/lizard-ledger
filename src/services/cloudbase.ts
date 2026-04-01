import cloudbase from '@cloudbase/js-sdk';

// 初始化 CloudBase
let app: any;
let db: any;
let auth: any;

try {
  app = cloudbase.init({
    env: 'mm223-7gozbhmt7b381a50', // 环境 ID
  });

  // 获取数据库引用
  db = app.database();

  // 获取认证引用
  auth = app.auth();

  console.log('CloudBase 初始化成功');
} catch (error) {
  console.error('CloudBase 初始化失败:', error);
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
    signInWithUsernameAndPassword: () => Promise.reject(new Error('CloudBase 未初始化')),
    signUp: () => Promise.reject(new Error('CloudBase 未初始化')),
    signOut: () => Promise.resolve(),
    currentUser: null
  };
}

export { db, auth };

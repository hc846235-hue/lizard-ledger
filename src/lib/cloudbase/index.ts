/**
 * CloudBase SDK 初始化
 * 提供 CloudBase 应用实例和数据库访问
 */

import cloudbase from '@cloudbase/js-sdk';
import { cloudbaseConfig } from './config';

// CloudBase 应用实例
let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;

/**
 * 初始化 CloudBase 应用
 * 注意: 必须在应用启动时同步初始化,不要使用动态导入
 */
export function initCloudbase() {
  if (!appInstance) {
    appInstance = cloudbase.init({
      env: cloudbaseConfig.envId,
    });

    // 获取数据库实例
    dbInstance = appInstance.database();

    // 获取认证实例
    authInstance = appInstance.auth();
  }

  return appInstance;
}

/**
 * 获取 CloudBase 应用实例
 */
export function getCloudbaseApp() {
  if (!appInstance) {
    initCloudbase();
  }
  return appInstance;
}

/**
 * 获取数据库实例
 */
export function getDatabase() {
  if (!dbInstance) {
    initCloudbase();
  }
  return dbInstance;
}

/**
 * 获取认证实例
 */
export function getAuth() {
  if (!authInstance) {
    initCloudbase();
  }
  return authInstance;
}

/**
 * 匿名登录
 */
export async function anonymousLogin() {
  try {
    const auth = getAuth();
    const loginResult = await auth.anonymousAuthProvider().signIn();
    console.log('匿名登录成功:', loginResult);
    return loginResult;
  } catch (error) {
    console.error('匿名登录失败:', error);
    throw error;
  }
}

/**
 * 检查登录状态
 */
export async function checkLoginStatus() {
  try {
    const auth = getAuth();
    const loginState = await auth.getLoginState();
    return loginState;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return null;
  }
}

/**
 * 登出
 */
export async function logout() {
  try {
    const auth = getAuth();
    await auth.signOut();
    console.log('登出成功');
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
}

// 导出查询运算符
export { getCloudbaseApp as app, getDatabase as db };

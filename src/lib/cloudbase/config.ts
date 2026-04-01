/**
 * CloudBase 配置
 * 从环境变量读取 CloudBase 环境信息
 */

export const cloudbaseConfig = {
  envId: import.meta.env.VITE_CLOUDBASE_ENV_ID || 'mm223-7gozbhmt7b381a50',
  authMode: import.meta.env.VITE_CLOUDBASE_AUTH || 'anonymous',
};

export default cloudbaseConfig;

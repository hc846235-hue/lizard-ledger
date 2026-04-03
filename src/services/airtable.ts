import Airtable from 'airtable';

// Airtable 配置
const AIRTABLE_BASE_ID = 'appqUhdWDESRx6EAa';
// 默认表名，建议用户在 Airtable 中重命名为 "账单" 或 "Bills"
const AIRTABLE_TABLE_NAME = '网格视图';

// 检查 API Key 是否有效
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || '';
const hasValidApiKey = API_KEY && API_KEY !== 'your_airtable_api_key_here';

// 初始化 Airtable
// 注意：需要用户提供 Personal Access Token
let airtable: any = null;

if (hasValidApiKey) {
  try {
    airtable = new Airtable({
      apiKey: API_KEY
    }).base(AIRTABLE_BASE_ID);

    console.log('✅ Airtable 初始化成功');
    console.log('Base ID:', AIRTABLE_BASE_ID);
    console.log('Table Name:', AIRTABLE_TABLE_NAME);
  } catch (error) {
    console.error('❌ Airtable 初始化失败:', error);
    airtable = null;
  }
} else {
  console.warn('⚠️ Airtable API Key 未配置，将使用本地存储');
  console.warn('如需使用 Airtable，请在 .env 文件中设置 VITE_AIRTABLE_API_KEY');
}

// 导出配置
export { airtable, AIRTABLE_TABLE_NAME, hasValidApiKey };

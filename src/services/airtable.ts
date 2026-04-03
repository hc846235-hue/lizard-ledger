import Airtable from 'airtable';

// Airtable 配置
const AIRTABLE_BASE_ID = 'appqUhdWDESRx6EAa';
// 默认表名，建议用户在 Airtable 中重命名为 "账单" 或 "Bills"
const AIRTABLE_TABLE_NAME = '网格视图';

// 初始化 Airtable
// 注意：需要用户提供 Personal Access Token
const airtable = new Airtable({
  apiKey: process.env.VITE_AIRTABLE_API_KEY || ''
}).base(AIRTABLE_BASE_ID);

console.log('Airtable 初始化成功');
console.log('Base ID:', AIRTABLE_BASE_ID);
console.log('Table Name:', AIRTABLE_TABLE_NAME);

export { airtable, AIRTABLE_TABLE_NAME };

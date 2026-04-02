// 在浏览器控制台运行此脚本来清除本地存储中的旧数据
console.log("开始清除本地存储...");

// 1. 清除所有交易数据
localStorage.removeItem('lizard-ledger-transactions');

// 2. 清除其他可能的缓存数据
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('lizard-ledger')) {
    console.log(`删除: ${key}`);
    localStorage.removeItem(key);
  }
});

console.log("✅ 本地存储已清除，请刷新页面");
console.log("然后按 Ctrl+Shift+R 硬刷新以加载新的分类数据");

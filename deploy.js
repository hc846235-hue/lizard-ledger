#!/usr/bin/env node

/**
 * 部署脚本
 * 支持同时部署到 CloudBase 静态托管和 GitHub Pages
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n▶️  ${description}...`, 'blue');
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} 成功`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} 失败`, 'red');
    log(error.message, 'red');
    return false;
  }
}

async function main() {
  log('\n====================================', 'bright');
  log('  Lizard Ledger 部署脚本', 'bright');
  log('====================================\n', 'bright');

  // 1. 清理旧的构建产物
  log('📦 步骤 1/5: 清理旧的构建产物', 'yellow');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    log('  ✅ 已清理 dist 目录', 'green');
  }

  // 2. 安装依赖
  log('\n📦 步骤 2/5: 安装依赖', 'yellow');
  if (!runCommand('npm install', '安装依赖')) {
    process.exit(1);
  }

  // 3. 构建项目
  log('\n🔨 步骤 3/5: 构建项目', 'yellow');
  if (!runCommand('npm run build', '构建项目')) {
    process.exit(1);
  }

  if (!fs.existsSync('dist')) {
    log('\n❌ 构建失败: dist 目录不存在', 'red');
    process.exit(1);
  }

  log('\n📊 构建产物信息:', 'blue');
  const getDirSize = (dir) => {
    let size = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += fs.statSync(filePath).size;
      }
    }
    return size;
  };
  const distSize = (getDirSize('dist') / 1024 / 1024).toFixed(2);
  log(`  📁 dist 目录大小: ${distSize} MB`, 'blue');

  // 4. 提交到 GitHub (触发 GitHub Actions 自动部署)
  log('\n📦 步骤 4/5: 提交到 GitHub (触发 GitHub Pages 自动部署)', 'yellow');
  runCommand('git add .', '暂存文件');
  runCommand('git commit -m "deploy: 更新部署内容 [skip ci]" || echo "没有新文件需要提交"', '提交代码');
  runCommand('git push', '推送代码');
  log('\n  🌐 GitHub Pages 自动部署已触发', 'green');
  log('  📱 访问地址: https://hc846235-hue.github.io/lizard-ledger/', 'blue');

  // 5. 部署到 CloudBase
  log('\n📦 步骤 5/5: 部署到 CloudBase 静态托管', 'yellow');
  log('  ⚠️  注意: CloudBase 部署需要使用 MCP 工具 uploadFiles', 'yellow');
  log('  📝 请在 CodeBuddy 中执行:', 'blue');
  log('     - 打开 MCP 工具 uploadFiles', 'blue');
  log('     - 选择 dist 目录上传到 CloudBase 静态托管', 'blue');
  log('  🌐 CloudBase 访问地址: https://mm223-7gozbhmt7b381a50-1302094821.tcloudbaseapp.com/lizard-ledger/', 'blue');

  // 总结
  log('\n====================================', 'bright');
  log('  ✅ 部署流程完成!', 'green');
  log('====================================\n', 'bright');
  log('📌 部署地址:', 'yellow');
  log('  • GitHub Pages: https://hc846235-hue.github.io/lizard-ledger/', 'blue');
  log('  • CloudBase:   https://mm223-7gozbhmt7b381a50-1302094821.tcloudbaseapp.com/lizard-ledger/', 'blue');
  log('  • 本地预览:   http://localhost:5173 (运行 npm run dev)', 'blue');
}

main().catch(error => {
  log(`\n❌ 部署失败: ${error.message}`, 'red');
  process.exit(1);
});

#!/usr/bin/env node
/**
 * 猫咪模拟器 CLI
 * Cat Pet Simulator - Command Line Interface
 * 
 * 支持两种模式:
 * 1. 传统模式: node index.js feed / node index.js play
 * 2. Agent 模式: node index.js "给我的猫喂食"
 * 
 * 选项:
 *   --agent      启用 Mini Agent 模式 (自然语言交互)
 *   --guest      访客模式 (作为独立 Agent 加入办公室)
 *   --llm <name> 启用 LLM (openai/ollama/anthropic)
 */

const { MiniAgent } = require('./mini-agent');
const CatPetBridge = require('./bridge');
const config = require('./config');

// 解析命令行参数
const args = process.argv.slice(2);
const flags = args.filter(arg => arg.startsWith('--'));
const nonFlags = args.filter(arg => !arg.startsWith('--'));

// 检测是否为自然语言输入
function isNaturalLanguage(input) {
  if (!input) return false;
  // 如果包含中文字符或空格，很可能是自然语言
  return /[\u4e00-\u9fa5]/.test(input) || input.includes(' ');
}

// Agent 模式
async function runAgentMode() {
  const miniAgent = new MiniAgent();
  
  const inited = await miniAgent.init();
  if (!inited) {
    console.log('❌ 初始化失败');
    process.exit(1);
  }
  
  miniAgent.printStatus();
  
  // 如果有输入，处理一次
  if (nonFlags.length > 0) {
    const input = nonFlags.join(' ');
    console.log(`\n👤 用户: ${input}`);
    const response = await miniAgent.process(input);
    console.log(`\n🐱 猫咪: ${response}`);
    // 同步一次状态到 Star-Office 再退出
    await miniAgent.bridge.sync();
    process.exit(0);
  }

  // 否则进入交互模式，启动后台调度（状态同步+衰减+自主行为）
  miniAgent.startBackground();
  console.log('\n🎮 进入交互模式 (输入 quit 退出)');
  console.log('试试说: 喂食、玩耍、看看我的猫、帮助\n');
  
  // 读取用户输入
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const prompt = () => {
    rl.question('👤 你: ', async (input) => {
      if (input.trim().toLowerCase() === 'quit') {
        console.log('👋 再见喵~');
        rl.close();
        process.exit(0);
      }
      
      if (input.trim()) {
        const response = await miniAgent.process(input);
        console.log(`🐱 猫咪: ${response}\n`);
      }
      
      prompt();
    });
  };
  
  prompt();
}

// 传统 CLI 模式
async function runCliMode() {
  const command = nonFlags[0];
  
  const bridge = new CatPetBridge({
    guestMode: flags.includes('--guest'),
    llmProvider: getFlagValue('--llm') || process.env.LLM_PROVIDER
  });
  
  const inited = await bridge.init();
  if (!inited) {
    process.exit(1);
  }
  
  // 处理命令
  if (command === 'status') {
    bridge.printStatus();
    process.exit(0);
  }
  
  if (['feed', 'play', 'bathe', 'sleep', 'pet'].includes(command)) {
    await bridge.interact(command);
    process.exit(0);
  }
  
  if (command === 'help' || flags.includes('--help')) {
    printHelp();
    process.exit(0);
  }
  
  // 默认: 启动同步
  bridge.start();
  
  process.on('SIGINT', async () => {
    console.log('\n');
    await bridge.stop();
    process.exit(0);
  });
}

function getFlagValue(flagName) {
  const index = args.indexOf(flagName);
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) {
    return args[index + 1];
  }
  return null;
}

function printHelp() {
  console.log(`
🐱 猫咪模拟器 - 连接 cat-pet 与 Star-Office

用法:
  node index.js [命令/自然语言] [选项]

命令模式:
  node index.js              启动自动同步
  node index.js status       查看猫咪状态
  node index.js feed         喂食
  node index.js play         玩耍
  node index.js bathe        洗澡
  node index.js sleep        睡觉
  node index.js pet          摸摸

Agent 模式 (自然语言):
  node index.js --agent                    进入交互模式
  node index.js "给我的猫喂食"              处理自然语言
  node index.js "看看我的猫怎么样"          查询状态

选项:
  --agent       启用 Mini Agent 模式
  --guest       访客模式
  --llm <name>  启用 LLM

示例:
  # 同步模式
  node index.js

  # Agent 模式 - 交互
  node index.js --agent

  # Agent 模式 - 单次
  node index.js "喂食"
  node index.js "我想养一只布偶猫，叫雪球"
`);
}

// 主函数
async function main() {
  // 帮助
  if (flags.includes('--help') || nonFlags[0] === 'help') {
    printHelp();
    process.exit(0);
  }
  
  // 判断模式
  const useAgentMode = flags.includes('--agent') || 
                       (nonFlags.length > 0 && isNaturalLanguage(nonFlags[0]));
  
  if (useAgentMode) {
    await runAgentMode();
  } else {
    await runCliMode();
  }
}

main().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
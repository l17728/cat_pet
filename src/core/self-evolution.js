/**
 * 自我进化系统 - 动态技能加载器
 * 
 * 功能:
 * - 定时扫描 extension 目录
 * - 动态加载新技能文件
 * - 避免重复加载（文件哈希追踪）
 * - 支持热更新
 * - 沙箱执行环境
 * 
 * 目录结构:
 * skills/cat-pet/
 * ├── extensions/           # 扩展目录
 * │   ├── loaded.json       # 已加载文件记录
 * │   ├── 2026-03-12/       # 日期子目录
 * │   │   ├── feature-xxx.js
 * │   │   └── improvement-yyy.js
 * │   └── 2026-03-13/
 * │       └── ...
 * └── src/
 *     └── core/
 *         └── self-evolution.js (本文件)
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SelfEvolutionSystem {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.extensionsDir = path.join(baseDir, 'extensions');
    this.loadedRecordFile = path.join(this.extensionsDir, 'loaded.json');
    
    // 已加载文件记录
    this.loadedFiles = new Map(); // filePath -> { hash, loadTime, module }
    
    // 加载的模块缓存
    this.moduleCache = new Map(); // moduleName -> module
    
    // 系统状态
    this.isScanning = false;
    this.lastScanTime = null;
    
    // 统计信息
    this.stats = {
      totalScans: 0,
      totalLoaded: 0,
      totalSkipped: 0,
      totalErrors: 0,
      lastError: null
    };
  }

  /**
   * 初始化系统
   */
  async init() {
    console.log('🧬 初始化自我进化系统...');
    
    try {
      // 确保扩展目录存在
      await fs.mkdir(this.extensionsDir, { recursive: true });
      
      // 加载已加载文件记录
      await this.loadRecord();
      
      // 扫描现有扩展
      await this.scanExtensions();
      
      console.log('✅ 自我进化系统初始化完成');
      console.log(`📊 已加载 ${this.loadedFiles.size} 个扩展文件`);
      
    } catch (error) {
      console.error('🚨 初始化自我进化系统失败:', error);
      this.stats.totalErrors++;
      this.stats.lastError = error.message;
    }
  }

  /**
   * 加载已加载文件记录
   */
  async loadRecord() {
    try {
      const content = await fs.readFile(this.loadedRecordFile, 'utf-8');
      const records = JSON.parse(content);
      
      // 恢复到 Map
      for (const [filePath, record] of Object.entries(records)) {
        this.loadedFiles.set(filePath, {
          ...record,
          module: null // 模块需要重新加载
        });
      }
      
      console.log(`📝 加载了 ${this.loadedFiles.size} 条加载记录`);
      
    } catch (error) {
      // 文件不存在，创建新记录
      await this.saveRecord();
      console.log('📝 创建新的加载记录');
    }
  }

  /**
   * 保存已加载文件记录
   */
  async saveRecord() {
    try {
      // 转换为普通对象
      const records = {};
      for (const [filePath, record] of this.loadedFiles.entries()) {
        records[filePath] = {
          hash: record.hash,
          loadTime: record.loadTime,
          moduleName: record.moduleName
          // 不保存 module 对象
        };
      }
      
      await fs.writeFile(
        this.loadedRecordFile,
        JSON.stringify(records, null, 2),
        'utf-8'
      );
      
    } catch (error) {
      console.error('🚨 保存加载记录失败:', error);
    }
  }

  /**
   * 计算文件哈希
   */
  async calculateFileHash(filePath) {
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 扫描扩展目录
   */
  async scanExtensions() {
    if (this.isScanning) {
      console.log('⏳ 正在扫描，跳过本次扫描');
      return;
    }

    this.isScanning = true;
    this.stats.totalScans++;

    try {
      console.log('🔍 开始扫描扩展目录...');
      
      const newFiles = await this.findNewFiles();
      
      if (newFiles.length === 0) {
        console.log('✅ 没有新文件，跳过加载');
        this.stats.totalSkipped++;
      } else {
        console.log(`🆕 发现 ${newFiles.length} 个新文件`);
        
        // 加载新文件
        for (const file of newFiles) {
          await this.loadExtensionFile(file);
        }
        
        // 保存记录
        await this.saveRecord();
      }
      
      this.lastScanTime = new Date();
      console.log('✅ 扫描完成');
      
    } catch (error) {
      console.error('🚨 扫描扩展目录失败:', error);
      this.stats.totalErrors++;
      this.stats.lastError = error.message;
      
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * 查找新文件
   */
  async findNewFiles() {
    const newFiles = [];
    
    try {
      // 递归扫描 extensions 目录
      const files = await this.scanDirectory(this.extensionsDir);
      
      for (const filePath of files) {
        // 跳过记录文件
        if (filePath.endsWith('loaded.json')) {
          continue;
        }
        
        // 只处理 JS 文件
        if (!filePath.endsWith('.js')) {
          continue;
        }
        
        // 检查是否已加载
        const existingRecord = this.loadedFiles.get(filePath);
        
        if (!existingRecord) {
          // 新文件
          newFiles.push(filePath);
        } else {
          // 检查文件是否变化
          const currentHash = await this.calculateFileHash(filePath);
          
          if (currentHash !== existingRecord.hash) {
            // 文件已更新
            console.log(`🔄 文件已更新：${filePath}`);
            newFiles.push(filePath);
          }
        }
      }
      
    } catch (error) {
      console.error('🚨 查找新文件失败:', error);
    }
    
    return newFiles;
  }

  /**
   * 递归扫描目录
   */
  async scanDirectory(dir, files = []) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, files);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
      
    } catch (error) {
      console.error(`🚨 扫描目录失败 ${dir}:`, error);
    }
    
    return files;
  }

  /**
   * 加载扩展文件
   */
  async loadExtensionFile(filePath) {
    try {
      console.log(`📦 加载扩展文件：${filePath}`);
      
      // 计算哈希
      const hash = await this.calculateFileHash(filePath);
      
      // 清除 require 缓存（如果是更新的文件）
      delete require.cache[require.resolve(filePath)];
      
      // 动态加载模块
      const module = require(filePath);
      
      // 生成模块名
      const moduleName = path.basename(filePath, '.js');
      
      // 记录加载信息
      this.loadedFiles.set(filePath, {
        hash,
        loadTime: new Date().toISOString(),
        moduleName,
        path: filePath
      });
      
      // 缓存模块
      this.moduleCache.set(moduleName, module);
      
      // 执行模块初始化（如果有）
      if (module.onLoad) {
        await module.onLoad();
      }
      
      this.stats.totalLoaded++;
      
      console.log(`✅ 加载成功：${moduleName}`);
      
      return {
        success: true,
        moduleName,
        path: filePath
      };
      
    } catch (error) {
      console.error(`🚨 加载扩展文件失败 ${filePath}:`, error);
      this.stats.totalErrors++;
      this.stats.lastError = error.message;
      
      return {
        success: false,
        error: error.message,
        path: filePath
      };
    }
  }

  /**
   * 获取已加载模块
   */
  getModule(moduleName) {
    return this.moduleCache.get(moduleName);
  }

  /**
   * 获取所有已加载模块
   */
  getAllModules() {
    return Object.fromEntries(this.moduleCache);
  }

  /**
   * 获取加载统计
   */
  getStats() {
    return {
      ...this.stats,
      loadedFiles: this.loadedFiles.size,
      cachedModules: this.moduleCache.size,
      lastScanTime: this.lastScanTime,
      isScanning: this.isScanning
    };
  }

  /**
   * 获取已加载文件列表
   */
  getLoadedFiles() {
    const files = [];
    for (const [filePath, record] of this.loadedFiles.entries()) {
      files.push({
        path: filePath,
        hash: record.hash,
        loadTime: record.loadTime,
        moduleName: record.moduleName
      });
    }
    return files;
  }

  /**
   * 卸载模块
   */
  async unloadModule(moduleName) {
    try {
      console.log(`🗑️ 卸载模块：${moduleName}`);
      
      // 查找文件路径
      let targetPath = null;
      for (const [filePath, record] of this.loadedFiles.entries()) {
        if (record.moduleName === moduleName) {
          targetPath = filePath;
          break;
        }
      }
      
      if (!targetPath) {
        console.log(`⚠️ 模块未找到：${moduleName}`);
        return false;
      }
      
      // 执行卸载回调
      const module = this.moduleCache.get(moduleName);
      if (module && module.onUnload) {
        await module.onUnload();
      }
      
      // 清除缓存
      this.moduleCache.delete(moduleName);
      this.loadedFiles.delete(targetPath);
      delete require.cache[require.resolve(targetPath)];
      
      // 保存记录
      await this.saveRecord();
      
      console.log(`✅ 卸载成功：${moduleName}`);
      
      return true;
      
    } catch (error) {
      console.error(`🚨 卸载模块失败 ${moduleName}:`, error);
      return false;
    }
  }

  /**
   * 强制重新加载
   */
  async forceReload() {
    console.log('🔄 强制重新加载所有扩展...');
    
    // 清空记录
    this.loadedFiles.clear();
    this.moduleCache.clear();
    
    // 重新扫描
    await this.scanExtensions();
    
    console.log('✅ 强制重新加载完成');
  }
}

module.exports = { SelfEvolutionSystem };

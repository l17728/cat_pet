/**
 * AIGC 猫咪相册生成器
 * 
 * 功能:
 * - 根据场景生成提示词
 * - 调用免费 AIGC 服务生成图片
 * - 保存猫咪相册
 * 
 * 免费 AIGC 服务:
 * - Hugging Face Inference API (免费额度)
 * - Stable Diffusion 公开 API
 * - Pollinations.ai (完全免费)
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

class AIGCPhotoGenerator {
  constructor(photoDir) {
    this.photoDir = photoDir;
    
    // 免费 AIGC 服务配置
    this.services = {
      // Pollinations.ai (推荐，完全免费，无需 API Key)
      pollinations: {
        name: 'Pollinations.ai',
        baseUrl: 'https://image.pollinations.ai/prompt/',
        free: true,
        requiresKey: false
      },
      
      // Hugging Face (有免费额度)
      huggingface: {
        name: 'Hugging Face',
        baseUrl: 'https://api-inference.huggingface.co/models/',
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        free: true,
        requiresKey: true
      }
    };
    
    // 当前使用的服务
    this.currentService = 'pollinations';
    
    // 场景提示词模板
    this.scenePrompts = {
      // 日常场景
      feeding: {
        name: '喂食',
        basePrompt: 'cute cat eating food, {color} {breed}, fluffy fur, big eyes, kawaii style, detailed, high quality',
        negativePrompt: 'ugly, deformed, low quality, blurry'
      },
      
      playing: {
        name: '玩耍',
        basePrompt: 'cute cat playing with toy, {color} {breed}, dynamic pose, happy expression, fluffy, detailed, high quality',
        negativePrompt: 'ugly, deformed, low quality, blurry, static'
      },
      
      sleeping: {
        name: '睡觉',
        basePrompt: 'cute cat sleeping peacefully, {color} {breed}, cozy, soft lighting, fluffy fur, serene expression, detailed',
        negativePrompt: 'ugly, deformed, low quality, blurry, awake'
      },
      
      bathing: {
        name: '洗澡',
        basePrompt: 'cute cat taking bath, {color} {breed}, wet fur, cute expression, bathroom setting, detailed, high quality',
        negativePrompt: 'ugly, deformed, low quality, blurry, dry'
      },
      
      // 特殊场景
      birthday: {
        name: '生日',
        basePrompt: 'cute cat celebrating birthday, {color} {breed}, birthday hat, cake, party decorations, festive, detailed',
        negativePrompt: 'ugly, deformed, low quality, blurry'
      },
      
      holiday: {
        name: '节日',
        basePrompt: 'cute cat in holiday theme, {color} {breed}, festive decorations, seasonal, detailed, high quality',
        negativePrompt: 'ugly, deformed, low quality, blurry'
      },
      
      // 成长记录
      growth: {
        name: '成长记录',
        basePrompt: 'cute {age} cat, {color} {breed}, growing up, healthy, bright eyes, fluffy, detailed portrait, high quality',
        negativePrompt: 'ugly, deformed, low quality, blurry, sick'
      },
      
      // 成就纪念
      achievement: {
        name: '成就纪念',
        basePrompt: 'proud cute cat with achievement medal, {color} {breed}, trophy, award, celebratory, detailed, high quality',
        negativePrompt: 'ugly, deformed, low quality, blurry, sad'
      }
    };
    
    // 猫咪品种特征
    this.breedFeatures = {
      '中华田园猫': 'Chinese garden cat, natural breed',
      '英国短毛猫': 'British Shorthair, round face, chubby',
      '美国短毛猫': 'American Shorthair, athletic build',
      '布偶猫': 'Ragdoll, blue eyes, long fur, elegant',
      '暹罗猫': 'Siamese, color points, blue eyes, slender',
      '波斯猫': 'Persian, long fur, flat face, luxurious',
      '缅因猫': 'Maine Coon, large size, tufted ears',
      '苏格兰折耳': 'Scottish Fold, folded ears, round face'
    };
    
    // 毛色描述
    this.colorFeatures = {
      '白色': 'white',
      '黑色': 'black',
      '灰色': 'gray',
      '橘色': 'orange tabby',
      '三花': 'calico, three colors',
      '玳瑁': 'tortoiseshell',
      '奶牛': 'black and white patches',
      '渐层': 'silver shaded'
    };
  }

  /**
   * 生成提示词
   */
  generatePrompt(scene, catData, extraOptions = {}) {
    const sceneTemplate = this.scenePrompts[scene] || this.scenePrompts.growth;
    
    // 获取品种特征
    const breedFeature = this.breedFeatures[catData.breed] || 'cute cat';
    
    // 获取毛色特征
    const colorFeature = this.colorFeatures[catData.color] || 'colorful';
    
    // 构建基础提示词
    let prompt = sceneTemplate.basePrompt
      .replace('{breed}', breedFeature)
      .replace('{color}', colorFeature);
    
    // 添加年龄信息
    if (catData.age) {
      if (catData.age <= 30) {
        prompt = prompt.replace('{age}', 'kitten');
      } else if (catData.age <= 365) {
        prompt = prompt.replace('{age}', 'young');
      } else {
        prompt = prompt.replace('{age}', 'adult');
      }
    }
    
    // 添加额外选项
    if (extraOptions.style) {
      prompt += `, ${extraOptions.style}`;
    }
    
    if (extraOptions.mood) {
      prompt += `, ${extraOptions.mood} mood`;
    }
    
    if (extraOptions.time) {
      prompt += `, ${extraOptions.time} lighting`;
    }
    
    // 添加质量增强词
    prompt += ', masterpiece, best quality, high resolution, detailed fur';
    
    return {
      prompt,
      negativePrompt: sceneTemplate.negativePrompt,
      scene: sceneTemplate.name
    };
  }

  /**
   * 调用 Pollinations.ai 生成图片（推荐）
   * API 文档：https://image.pollinations.ai/prompt/你的中文描述
   * 速率限制：1 QPS（每秒 1 次）
   */
  async generateWithPollinations(prompt, outputPath, options = {}) {
    const width = options.width || 1024;
    const height = options.height || 1024;
    const nologo = options.nologo !== false;
    const seed = options.seed || Math.floor(Math.random() * 1000000);
    
    try {
      // 构建 API URL（使用官方推荐格式）
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=${nologo}&seed=${seed}`;
      
      console.log(`🎨 请求 Pollinations.AI: ${imageUrl}`);
      
      // 下载图片（带重试）
      await this.downloadWithRetry(imageUrl, outputPath);
      
      console.log(`🎨 Pollinations.ai 生成成功：${outputPath}`);
      
      return {
        success: true,
        service: 'Pollinations.ai',
        path: outputPath,
        prompt,
        url: imageUrl
      };
    } catch (error) {
      console.error('🚨 Pollinations.ai 生成失败:', error);
      throw error;
    }
  }

  /**
   * 带重试的下载（避免速率限制）
   */
  async downloadWithRetry(url, outputPath, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.downloadImage(url, outputPath);
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // 等待后重试（避免速率限制）
        const waitTime = (i + 1) * 1000;
        console.log(`⏳ 等待 ${waitTime}ms 后重试 (${i + 1}/${maxRetries})...`);
        await this.sleep(waitTime);
      }
    }
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 调用 Hugging Face 生成图片
   */
  async generateWithHuggingFace(prompt, apiKey, outputPath) {
    try {
      const model = this.services.huggingface.model;
      const url = `${this.services.huggingface.baseUrl}${model}`;
      
      const response = await this.fetchWithPost(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: 'ugly, deformed, low quality, blurry',
            num_inference_steps: 30,
            guidance_scale: 7.5
          }
        })
      });
      
      // 保存生成的图片
      await fs.writeFile(outputPath, response);
      
      console.log(`🎨 Hugging Face 生成成功：${outputPath}`);
      
      return {
        success: true,
        service: 'Hugging Face',
        path: outputPath,
        prompt
      };
    } catch (error) {
      console.error('🚨 Hugging Face 生成失败:', error);
      throw error;
    }
  }

  /**
   * 下载图片
   */
  async downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
      const file = require('fs').createWriteStream(outputPath);
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        require('fs').unlink(outputPath, () => {});
        reject(err);
      });
    });
  }

  /**
   * POST 请求
   */
  async fetchWithPost(url, options) {
    return new Promise((resolve, reject) => {
      const postData = options.body;
      const parsedUrl = new URL(url);
      
      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: options.headers
      };
      
      const req = https.request(reqOptions, (res) => {
        const chunks = [];
        
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(Buffer.concat(chunks));
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * 生成猫咪照片（主方法）
   */
  async generateCatPhoto(userId, catData, scene, options = {}) {
    try {
      // 确保照片目录存在
      const userPhotoDir = path.join(this.photoDir, userId);
      await fs.mkdir(userPhotoDir, { recursive: true });
      
      // 生成提示词
      const { prompt, negativePrompt } = this.generatePrompt(scene, catData, options);
      
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${scene}_${timestamp}.jpg`;
      const outputPath = path.join(userPhotoDir, filename);
      
      // 选择服务生成
      let result;
      
      if (this.currentService === 'pollinations') {
        result = await this.generateWithPollinations(prompt, outputPath);
      } else if (this.currentService === 'huggingface' && options.apiKey) {
        result = await this.generateWithHuggingFace(prompt, options.apiKey, outputPath);
      } else {
        // 降级到 Pollinations
        result = await this.generateWithPollinations(prompt, outputPath);
      }
      
      // 保存照片记录
      await this.savePhotoRecord(userId, {
        filename,
        scene,
        prompt,
        negativePrompt,
        service: result.service,
        timestamp: new Date().toISOString(),
        options
      });
      
      return {
        success: true,
        path: outputPath,
        filename,
        prompt,
        service: result.service
      };
      
    } catch (error) {
      console.error('🚨 生成猫咪照片失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 保存照片记录
   */
  async savePhotoRecord(userId, photoData) {
    try {
      const recordFile = path.join(this.photoDir, userId, 'photos.json');
      
      let records = [];
      try {
        const content = await fs.readFile(recordFile, 'utf-8');
        records = JSON.parse(content);
      } catch (e) {
        // 文件不存在，创建新记录
      }
      
      records.push(photoData);
      
      await fs.writeFile(recordFile, JSON.stringify(records, null, 2), 'utf-8');
      
      console.log(`📝 照片记录已保存：${userId}`);
    } catch (error) {
      console.error('🚨 保存照片记录失败:', error);
    }
  }

  /**
   * 获取用户相册
   */
  async getPhotoAlbum(userId) {
    try {
      const recordFile = path.join(this.photoDir, userId, 'photos.json');
      
      try {
        const content = await fs.readFile(recordFile, 'utf-8');
        const records = JSON.parse(content);
        
        return {
          success: true,
          photos: records,
          total: records.length
        };
      } catch (e) {
        return {
          success: true,
          photos: [],
          total: 0
        };
      }
    } catch (error) {
      console.error('🚨 获取相册失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取可用场景列表
   */
  getAvailableScenes() {
    return Object.entries(this.scenePrompts).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: `生成${value.name}场景的猫咪照片`
    }));
  }

  /**
   * 设置使用的 AIGC 服务
   */
  setService(serviceName) {
    if (this.services[serviceName]) {
      this.currentService = serviceName;
      console.log(`✅ 已切换到 ${this.services[serviceName].name}`);
      return true;
    }
    return false;
  }
}

module.exports = { AIGCPhotoGenerator };

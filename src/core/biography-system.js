/**
 * 猫生传记系统
 * 
 * 实现云猫世界的完整传记系统：
 * - 传记章节自动生成
 * - 第一次系列记录
 * - 成长里程碑
 * - 传记导出（Markdown/PDF）
 * - 时间线
 */

class BiographySystem {
  constructor() {
    // 传记章节模板
    this.chapterTemplates = {
      chapter_1: {
        id: 'chapter_1',
        title: '第一章：相遇',
        description: '与主人的初次相遇',
        triggerCondition: { type: 'first_meeting' },
        content: `那是一个特别的日子，你来到了这个世界。第一眼看到主人时，你们的眼神交汇，仿佛注定要成为彼此生命中最重要的存在。`
      },
      chapter_2: {
        id: 'chapter_2',
        title: '第二章：新家',
        description: '适应新家的第一周',
        triggerCondition: { type: 'days', value: 7 },
        content: `来到新家已经一周了。从一开始的紧张不安，到现在的自在舒适，这里已经成为了你的家。主人对你很好，每天都有好吃的，还有温暖的窝。`
      },
      chapter_3: {
        id: 'chapter_3',
        title: '第三章：成长',
        description: '从奶猫到幼猫的成长',
        triggerCondition: { type: 'stage_change', from: 'kitten', to: 'juvenile' },
        content: `你长大了！不再是那个只会睡觉的小奶猫了。你开始好奇地探索这个世界，学习各种技能，每天都充满惊喜。`
      },
      chapter_4: {
        id: 'chapter_4',
        title: '第四章：朋友',
        description: '结交猫咪朋友',
        triggerCondition: { type: 'friend_count', value: 5 },
        content: `你交到了很多好朋友！在猫咪广场，在阳光花园，到处都有你的小伙伴。你们一起玩耍，一起分享，生活变得更加精彩。`
      },
      chapter_5: {
        id: 'chapter_5',
        title: '第五章：冒险',
        description: '探索所有场景',
        triggerCondition: { type: 'all_scenes' },
        content: `你的足迹遍布了整个世界！从温馨的房间到神秘的云端城堡，从阳光花园到城市屋顶，每一个地方都留下了你的回忆。`
      },
      chapter_6: {
        id: 'chapter_6',
        title: '第六章：羁绊',
        description: '与主人的深厚羁绊',
        triggerCondition: { type: 'bond', value: 100 },
        content: `你和主人之间的羁绊已经达到了顶峰。一个眼神，一个动作，你们就能明白彼此的心意。这就是真正的灵魂伴侣。`
      },
      final_chapter: {
        id: 'final_chapter',
        title: '终章：传奇',
        description: '达到终极形态',
        triggerCondition: { type: 'stage', value: 'ultimate' },
        content: `你达到了传说中的终极形态！不仅拥有了传奇技能，更成为了所有猫咪敬仰的存在。但对你来说，最重要的依然是和主人在一起的每一天。`
      }
    };

    // 第一次系列
    this.firstTimes = {
      first_meeting: { name: '第一次见面', description: '与主人初次相遇' },
      first_meal: { name: '第一顿饭', description: '吃猫生的第一顿饭' },
      first_play: { name: '第一次玩耍', description: '第一次和主人玩耍' },
      first_sleep: { name: '第一次睡觉', description: '在新家的第一次睡眠' },
      first_explore: { name: '第一次探索', description: '第一次外出探索' },
      first_skill: { name: '第一个技能', description: '学会第一个技能' },
      first_friend: { name: '第一个朋友', description: '结交第一个猫咪朋友' },
      first_sick: { name: '第一次生病', description: '第一次生病看医生' },
      first_birthday: { name: '第一次生日', description: '第一次过生日' },
      first_dream: { name: '第一次做梦', description: '第一次做梦' }
    };
  }

  /**
   * 初始化传记数据
   */
  initBiographyData(catData) {
    catData.biography = {
      chapters: [],
      firstTimes: {},
      milestones: [],
      createdAt: new Date().toISOString()
    };
    return catData;
  }

  /**
   * 记录第一次
   */
  recordFirstTime(catData, firstTimeType, details = {}) {
    if (!catData.biography) {
      this.initBiographyData(catData);
    }

    const firstTime = this.firstTimes[firstTimeType];
    if (!firstTime) return { success: false, error: '第一次类型不存在' };

    // 检查是否已经记录
    if (catData.biography.firstTimes[firstTimeType]) {
      return { success: false, error: '已经记录过了' };
    }

    // 记录第一次
    catData.biography.firstTimes[firstTimeType] = {
      type: firstTimeType,
      name: firstTime.name,
      description: firstTime.description,
      timestamp: new Date().toISOString(),
      details
    };

    return {
      success: true,
      firstTime: firstTime.name,
      message: `记录了${firstTime.name}！`
    };
  }

  /**
   * 检查并生成传记章节
   */
  checkAndGenerateChapter(catData) {
    const newChapters = [];

    for (const chapter of Object.values(this.chapterTemplates)) {
      // 检查是否已经生成
      if (catData.biography.chapters.find(c => c.id === chapter.id)) {
        continue;
      }

      // 检查触发条件
      if (this.checkChapterCondition(catData, chapter.triggerCondition)) {
        const newChapter = {
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          content: chapter.content,
          generatedAt: new Date().toISOString(),
          catLevel: catData.level,
          catStage: catData.stage
        };

        catData.biography.chapters.push(newChapter);
        newChapters.push(newChapter);
      }
    }

    return newChapters;
  }

  /**
   * 检查章节条件
   */
  checkChapterCondition(catData, condition) {
    switch (condition.type) {
      case 'first_meeting':
        return catData.biography?.firstTimes?.first_meeting ? true : false;

      case 'days':
        const daysSinceCreation = this.getDaysSince(catData.biography?.createdAt);
        return daysSinceCreation >= condition.value;

      case 'stage_change':
        return catData.stage === condition.to;

      case 'friend_count':
        return (catData.friends || []).length >= condition.value;

      case 'all_scenes':
        const totalScenes = 7;
        const unlockedScenes = (catData.unlockedScenes || []).length;
        return unlockedScenes >= totalScenes;

      case 'bond':
        return (catData.bond || 0) >= condition.value;

      case 'stage':
        return catData.stage === condition.value;

      default:
        return false;
    }
  }

  /**
   * 记录里程碑
   */
  recordMilestone(catData, milestone) {
    if (!catData.biography) {
      this.initBiographyData(catData);
    }

    catData.biography.milestones.push({
      ...milestone,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }

  /**
   * 生成传记 Markdown
   */
  generateMarkdown(catData) {
    let markdown = `# 🐱 ${catData.name} 的猫生传记\n\n`;
    markdown += `**品种**: ${catData.breed}\n`;
    markdown += `**毛色**: ${catData.color}\n`;
    markdown += `**性别**: ${catData.gender === 'male' ? '公' : '母'}\n`;
    markdown += `**出生日期**: ${catData.biography?.createdAt || '未知'}\n\n`;

    // 目录
    markdown += `## 📑 目录\n\n`;
    if (catData.biography?.chapters && catData.biography.chapters.length > 0) {
      catData.biography.chapters.forEach(chapter => {
        markdown += `- ${chapter.title}\n`;
      });
    }
    markdown += `\n`;

    // 第一次系列
    markdown += `## 🎉 第一次系列\n\n`;
    if (catData.biography?.firstTimes) {
      for (const [type, data] of Object.entries(catData.biography.firstTimes)) {
        markdown += `### ${data.name}\n`;
        markdown += `${data.description}\n`;
        markdown += `**时间**: ${data.timestamp}\n\n`;
      }
    }

    // 传记章节
    markdown += `## 📖 传记章节\n\n`;
    if (catData.biography?.chapters && catData.biography.chapters.length > 0) {
      catData.biography.chapters.forEach(chapter => {
        markdown += `### ${chapter.title}\n\n`;
        markdown += `${chapter.content}\n\n`;
        markdown += `*记录于${chapter.generatedAt}，等级${chapter.catLevel}，阶段${chapter.catStage}*\n\n`;
      });
    }

    // 里程碑
    markdown += `## 🏆 成长里程碑\n\n`;
    if (catData.biography?.milestones && catData.biography.milestones.length > 0) {
      catData.biography.milestones.forEach(milestone => {
        markdown += `- **${milestone.title}**: ${milestone.description} (${milestone.timestamp})\n`;
      });
    }

    return markdown;
  }

  /**
   * 导出传记
   */
  async exportBiography(catData, format = 'md') {
    if (format === 'md') {
      return this.generateMarkdown(catData);
    }

    if (format === 'json') {
      return JSON.stringify(catData.biography, null, 2);
    }

    return this.generateMarkdown(catData);
  }

  /**
   * 获取传记统计
   */
  getBiographyStats(catData) {
    return {
      totalChapters: catData.biography?.chapters?.length || 0,
      totalFirstTimes: Object.keys(catData.biography?.firstTimes || {}).length,
      totalMilestones: catData.biography?.milestones?.length || 0,
      completionRate: this.calculateCompletionRate(catData),
      createdAt: catData.biography?.createdAt
    };
  }

  /**
   * 计算传记完成度
   */
  calculateCompletionRate(catData) {
    const totalChapters = Object.keys(this.chapterTemplates).length;
    const completedChapters = catData.biography?.chapters?.length || 0;
    
    const totalFirstTimes = Object.keys(this.firstTimes).length;
    const completedFirstTimes = Object.keys(catData.biography?.firstTimes || {}).length;

    const chapterRate = (completedChapters / totalChapters) * 100;
    const firstTimeRate = (completedFirstTimes / totalFirstTimes) * 100;

    return ((chapterRate + firstTimeRate) / 2).toFixed(1);
  }

  /**
   * 获取天数
   */
  getDaysSince(dateString) {
    if (!dateString) return 0;
    const startDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取所有第一次类型
   */
  getAllFirstTimes() {
    return Object.values(this.firstTimes);
  }

  /**
   * 获取所有章节模板
   */
  getAllChapterTemplates() {
    return Object.values(this.chapterTemplates);
  }
}

module.exports = { BiographySystem };

/**
 * 技能树系统
 * 
 * 实现云猫世界的完整技能系统（参考 cloud-cat-world 设计）：
 * - 5 大类技能（基础/生活/表演/特殊/传奇）
 * - 技能学习机制
 * - 技能使用系统
 * - 技能树进度
 */

class SkillTreeSystem {
  constructor() {
    // 技能树定义
    this.skillTree = {
      // ===== 基础技能 =====
      basic: {
        id: 'basic',
        name: '基础技能',
        description: '猫咪必须掌握的基本技能',
        skills: {
          handshake: {
            id: 'handshake',
            name: '握手',
            description: '和主人握手',
            difficulty: 1,
            expReward: 20,
            coinReward: 10,
            prerequisites: [],
            category: 'basic'
          },
          sit: {
            id: 'sit',
            name: '坐下',
            description: '听从指令坐下',
            difficulty: 1,
            expReward: 20,
            coinReward: 10,
            prerequisites: [],
            category: 'basic'
          },
          come: {
            id: 'come',
            name: '过来',
            description: '听到呼唤就过来',
            difficulty: 1,
            expReward: 20,
            coinReward: 10,
            prerequisites: [],
            category: 'basic'
          },
          stay: {
            id: 'stay',
            name: '等待',
            description: '保持原地等待',
            difficulty: 2,
            expReward: 30,
            coinReward: 15,
            prerequisites: ['sit'],
            category: 'basic'
          },
          lie_down: {
            id: 'lie_down',
            name: '躺下',
            description: '听从指令躺下',
            difficulty: 2,
            expReward: 30,
            coinReward: 15,
            prerequisites: ['sit'],
            category: 'basic'
          },
          roll_over: {
            id: 'roll_over',
            name: '打滚',
            description: '在地上打滚',
            difficulty: 3,
            expReward: 50,
            coinReward: 25,
            prerequisites: ['lie_down'],
            category: 'basic'
          }
        }
      },

      // ===== 生活技能 =====
      life: {
        id: 'life',
        name: '生活技能',
        description: '独立生活必备技能',
        skills: {
          use_litter: {
            id: 'use_litter',
            name: '用猫砂盆',
            description: '自己使用猫砂盆',
            difficulty: 1,
            expReward: 30,
            coinReward: 20,
            prerequisites: [],
            category: 'life'
          },
          eat_alone: {
            id: 'eat_alone',
            name: '自己吃饭',
            description: '独立进食',
            difficulty: 1,
            expReward: 20,
            coinReward: 15,
            prerequisites: [],
            category: 'life'
          },
          drink_alone: {
            id: 'drink_alone',
            name: '自己喝水',
            description: '独立饮水',
            difficulty: 1,
            expReward: 20,
            coinReward: 15,
            prerequisites: [],
            category: 'life'
          },
          groom_self: {
            id: 'groom_self',
            name: '自我梳理',
            description: '自己梳理毛发',
            difficulty: 2,
            expReward: 30,
            coinReward: 20,
            prerequisites: [],
            category: 'life'
          },
          open_door: {
            id: 'open_door',
            name: '开门',
            description: '学会打开房门',
            difficulty: 4,
            expReward: 80,
            coinReward: 50,
            prerequisites: ['use_litter'],
            category: 'life'
          },
          find_food: {
            id: 'find_food',
            name: '找食物',
            description: '能找到藏起来的食物',
            difficulty: 3,
            expReward: 50,
            coinReward: 30,
            prerequisites: ['eat_alone'],
            category: 'life'
          }
        }
      },

      // ===== 表演技能 =====
      performance: {
        id: 'performance',
        name: '表演技能',
        description: '展示给主人看的才艺',
        skills: {
          spin: {
            id: 'spin',
            name: '转圈',
            description: '原地转圈圈',
            difficulty: 2,
            expReward: 40,
            coinReward: 25,
            prerequisites: [],
            category: 'performance'
          },
          high_five: {
            id: 'high_five',
            name: '击掌',
            description: '和主人击掌',
            difficulty: 2,
            expReward: 40,
            coinReward: 25,
            prerequisites: ['handshake'],
            category: 'performance'
          },
          play_dead: {
            id: 'play_dead',
            name: '装死',
            description: '装死逗主人开心',
            difficulty: 4,
            expReward: 80,
            coinReward: 50,
            prerequisites: ['lie_down'],
            category: 'performance'
          },
          jump: {
            id: 'jump',
            name: '跳跃',
            description: '跳过障碍物',
            difficulty: 3,
            expReward: 60,
            coinReward: 35,
            prerequisites: [],
            category: 'performance'
          },
          fetch: {
            id: 'fetch',
            name: '捡东西',
            description: '把扔出去的东西捡回来',
            difficulty: 4,
            expReward: 80,
            coinReward: 50,
            prerequisites: ['come'],
            category: 'performance'
          },
          dance: {
            id: 'dance',
            name: '跳舞',
            description: '跟着音乐跳舞',
            difficulty: 5,
            expReward: 120,
            coinReward: 80,
            prerequisites: ['spin', 'high_five'],
            category: 'performance'
          }
        }
      },

      // ===== 特殊技能 =====
      special: {
        id: 'special',
        name: '特殊技能',
        description: '独特的特殊能力',
        skills: {
          predict_weather: {
            id: 'predict_weather',
            name: '预知天气',
            description: '预知即将到来的天气',
            difficulty: 5,
            expReward: 150,
            coinReward: 100,
            prerequisites: [],
            category: 'special'
          },
          find_things: {
            id: 'find_things',
            name: '找东西',
            description: '帮助主人找丢失的物品',
            difficulty: 4,
            expReward: 100,
            coinReward: 70,
            prerequisites: ['find_food'],
            category: 'special'
          },
          comfort_owner: {
            id: 'comfort_owner',
            name: '安慰主人',
            description: '在主人难过时安慰',
            difficulty: 5,
            expReward: 150,
            coinReward: 100,
            prerequisites: [],
            category: 'special'
          },
          wake_up: {
            id: 'wake_up',
            name: '叫醒服务',
            description: '早上准时叫醒主人',
            difficulty: 3,
            expReward: 60,
            coinReward: 40,
            prerequisites: [],
            category: 'special'
          },
          guard_home: {
            id: 'guard_home',
            name: '看家护院',
            description: '警惕陌生人',
            difficulty: 4,
            expReward: 100,
            coinReward: 70,
            prerequisites: [],
            category: 'special'
          }
        }
      },

      // ===== 传奇技能 =====
      legendary: {
        id: 'legendary',
        name: '传奇技能',
        description: '只有终极形态才能学会的传奇技能',
        skills: {
          telepathy: {
            id: 'telepathy',
            name: '心灵感应',
            description: '和主人心灵相通',
            difficulty: 10,
            expReward: 500,
            coinReward: 300,
            prerequisites: ['comfort_owner'],
            category: 'legendary',
            requirement: {
              stage: 'ultimate',
              bond: 100
            }
          },
          teleport: {
            id: 'teleport',
            name: '瞬间移动',
            description: '瞬间移动到任何场景',
            difficulty: 10,
            expReward: 500,
            coinReward: 300,
            prerequisites: [],
            category: 'legendary',
            requirement: {
              stage: 'ultimate',
              level: 60
            }
          },
          time_travel: {
            id: 'time_travel',
            name: '穿越时空',
            description: '短暂穿越到过去或未来',
            difficulty: 10,
            expReward: 500,
            coinReward: 300,
            prerequisites: ['predict_weather'],
            category: 'legendary',
            requirement: {
              stage: 'ultimate',
              level: 80
            }
          },
          dream_visit: {
            id: 'dream_visit',
            name: '托梦',
            description: '在梦中与主人相见',
            difficulty: 10,
            expReward: 500,
            coinReward: 300,
            prerequisites: ['telepathy'],
            category: 'legendary',
            requirement: {
              stage: 'ultimate',
              bond: 100
            }
          }
        }
      }
    };

    // 技能类别元数据
    this.categoryMeta = {
      basic: { name: '基础技能', icon: '📚', color: 'blue' },
      life: { name: '生活技能', icon: '🏠', color: 'green' },
      performance: { name: '表演技能', icon: '🎭', color: 'purple' },
      special: { name: '特殊技能', icon: '✨', color: 'orange' },
      legendary: { name: '传奇技能', icon: '🌟', color: 'gold' }
    };
  }

  /**
   * 获取技能详情
   */
  getSkill(skillId) {
    for (const category of Object.values(this.skillTree)) {
      if (category.skills[skillId]) {
        return category.skills[skillId];
      }
    }
    return null;
  }

  /**
   * 获取某类别的所有技能
   */
  getSkillsByCategory(categoryId) {
    const category = this.skillTree[categoryId];
    if (!category) return [];
    
    return Object.values(category.skills).map(skill => ({
      ...skill,
      categoryInfo: this.categoryMeta[categoryId]
    }));
  }

  /**
   * 获取所有技能
   */
  getAllSkills() {
    const allSkills = [];
    for (const [categoryId, category] of Object.entries(this.skillTree)) {
      for (const skill of Object.values(category.skills)) {
        allSkills.push({
          ...skill,
          categoryInfo: this.categoryMeta[categoryId]
        });
      }
    }
    return allSkills;
  }

  /**
   * 检查是否可以学习技能
   */
  canLearnSkill(catData, skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) return { canLearn: false, reason: '技能不存在' };

    // 检查前置技能
    if (skill.prerequisites && skill.prerequisites.length > 0) {
      for (const prereq of skill.prerequisites) {
        if (!catData.skills || !catData.skills.includes(prereq)) {
          return {
            canLearn: false,
            reason: `需要先学会技能：${this.getSkill(prereq)?.name || prereq}`
          };
        }
      }
    }

    // 检查传奇技能的特殊要求
    if (skill.requirement) {
      if (skill.requirement.stage && catData.stage !== skill.requirement.stage) {
        return {
          canLearn: false,
          reason: `需要达到${skill.requirement.stage}阶段`
        };
      }
      if (skill.requirement.level && catData.level < skill.requirement.level) {
        return {
          canLearn: false,
          reason: `需要达到${skill.requirement.level}级`
        };
      }
      if (skill.requirement.bond && catData.bond < skill.requirement.bond) {
        return {
          canLearn: false,
          reason: `需要羁绊达到${skill.requirement.bond}`
        };
      }
    }

    // 检查是否已经学会
    if (catData.skills && catData.skills.includes(skillId)) {
      return { canLearn: false, reason: '已经学会该技能' };
    }

    return { canLearn: true };
  }

  /**
   * 学习技能
   */
  learnSkill(catData, skillId) {
    const checkResult = this.canLearnSkill(catData, skillId);
    if (!checkResult.canLearn) {
      return {
        success: false,
        error: checkResult.reason
      };
    }

    const skill = this.getSkill(skillId);
    
    // 初始化技能列表
    if (!catData.skills) {
      catData.skills = [];
    }
    if (!catData.skillDetails) {
      catData.skillDetails = {};
    }

    // 添加技能
    catData.skills.push(skillId);
    catData.skillDetails[skillId] = {
      learnedAt: new Date().toISOString(),
      mastery: 0,
      timesUsed: 0
    };

    return {
      success: true,
      skill: skill.name,
      expReward: skill.expReward,
      coinReward: skill.coinReward,
      category: this.categoryMeta[skill.category].name
    };
  }

  /**
   * 使用技能
   */
  useSkill(catData, skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) {
      return { success: false, error: '技能不存在' };
    }

    if (!catData.skills || !catData.skills.includes(skillId)) {
      return { success: false, error: '未学会该技能' };
    }

    // 增加技能熟练度
    if (catData.skillDetails && catData.skillDetails[skillId]) {
      catData.skillDetails[skillId].timesUsed = (catData.skillDetails[skillId].timesUsed || 0) + 1;
      catData.skillDetails[skillId].mastery = Math.min(100, (catData.skillDetails[skillId].mastery || 0) + 1);
    }

    return {
      success: true,
      skill: skill.name,
      description: skill.description,
      mastery: catData.skillDetails[skillId].mastery
    };
  }

  /**
   * 获取技能统计
   */
  getSkillStats(catData) {
    const allSkills = this.getAllSkills();
    const learnedSkills = catData.skills || [];
    
    const stats = {
      total: allSkills.length,
      learned: learnedSkills.length,
      progress: ((learnedSkills.length / allSkills.length) * 100).toFixed(1),
      byCategory: {}
    };

    // 按类别统计
    for (const [categoryId, category] of Object.entries(this.skillTree)) {
      const categorySkills = Object.values(category.skills);
      const learnedInCategory = categorySkills.filter(s => learnedSkills.includes(s.id)).length;
      
      stats.byCategory[categoryId] = {
        name: this.categoryMeta[categoryId].name,
        icon: this.categoryMeta[categoryId].icon,
        total: categorySkills.length,
        learned: learnedInCategory,
        progress: ((learnedInCategory / categorySkills.length) * 100).toFixed(1)
      };
    }

    return stats;
  }

  /**
   * 检查是否完成某类别所有技能
   */
  hasAllSkillsInCategory(catData, categoryId) {
    const category = this.skillTree[categoryId];
    if (!category) return false;

    const allSkills = Object.keys(category.skills);
    const learnedSkills = catData.skills || [];
    
    return allSkills.every(skillId => learnedSkills.includes(skillId));
  }

  /**
   * 获取技能树进度
   */
  getSkillTreeProgress(catData) {
    const allSkills = this.getAllSkills();
    const learnedSkills = catData.skills || [];
    
    const progress = {
      overall: ((learnedSkills.length / allSkills.length) * 100).toFixed(1),
      categories: {}
    };

    for (const [categoryId, category] of Object.entries(this.skillTree)) {
      const categorySkills = Object.keys(category.skills);
      const learnedInCategory = categorySkills.filter(id => learnedSkills.includes(id)).length;
      
      progress.categories[categoryId] = {
        name: this.categoryMeta[categoryId].name,
        progress: ((learnedInCategory / categorySkills.length) * 100).toFixed(1)
      };
    }

    return progress;
  }

  /**
   * 获取可学习的技能列表
   */
  getAvailableSkills(catData) {
    const allSkills = this.getAllSkills();
    const learnedSkills = catData.skills || [];
    
    return allSkills.filter(skill => {
      if (learnedSkills.includes(skill.id)) return false;
      
      const checkResult = this.canLearnSkill(catData, skill.id);
      return checkResult.canLearn;
    });
  }
}

module.exports = { SkillTreeSystem };

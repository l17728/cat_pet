/**
 * 成就系统
 * 
 * 实现云猫世界的完整成就系统（参考 cloud-cat-world/SYSTEMS.md）：
 * - 成长成就
 * - 技能成就
 * - 探索成就
 * - 社交成就
 * - 羁绊成就
 */

class AchievementSystem {
  constructor() {
    // 成就定义
    this.achievements = {
      // ===== 成长成就 =====
      growth: {
        first_day: {
          id: 'first_day',
          name: '第一天',
          description: '和猫咪相遇的第一天',
          category: 'growth',
          condition: { type: 'days', value: 1 },
          reward: { coins: 10, title: '新手铲屎官' }
        },
        first_week: {
          id: 'first_week',
          name: '第一周陪伴',
          description: '连续照顾猫咪 7 天',
          category: 'growth',
          condition: { type: 'streak', value: 7 },
          reward: { coins: 50, title: '细心铲屎官' }
        },
        first_month: {
          id: 'first_month',
          name: '满月庆祝',
          description: '陪伴猫咪 30 天',
          category: 'growth',
          condition: { type: 'days', value: 30 },
          reward: { coins: 200, title: '资深铲屎官' }
        },
        hundred_days: {
          id: 'hundred_days',
          name: '百日陪伴',
          description: '陪伴猫咪 100 天',
          category: 'growth',
          condition: { type: 'days', value: 100 },
          reward: { coins: 500, title: '百日挚友' }
        },
        stage_kitten: {
          id: 'stage_kitten',
          name: '奶猫成长',
          description: '猫咪进入幼猫期',
          category: 'growth',
          condition: { type: 'stage', value: 'juvenile' },
          reward: { coins: 100, exp: 100 }
        },
        stage_youth: {
          id: 'stage_youth',
          name: '青春绽放',
          description: '猫咪进入青年期',
          category: 'growth',
          condition: { type: 'stage', value: 'youth' },
          reward: { coins: 200, exp: 200 }
        },
        stage_adult: {
          id: 'stage_adult',
          name: '成熟稳重',
          description: '猫咪进入成年期',
          category: 'growth',
          condition: { type: 'stage', value: 'adult' },
          reward: { coins: 400, exp: 400 }
        },
        stage_ultimate: {
          id: 'stage_ultimate',
          name: '传奇蜕变',
          description: '猫咪达到终极形态',
          category: 'growth',
          condition: { type: 'stage', value: 'ultimate' },
          reward: { coins: 1000, exp: 1000, title: '传奇铲屎官' }
        }
      },

      // ===== 技能成就 =====
      skill: {
        skill_beginner: {
          id: 'skill_beginner',
          name: '技能新手',
          description: '学会 5 个技能',
          category: 'skill',
          condition: { type: 'skill_count', value: 5 },
          reward: { coins: 50 }
        },
        skill_learner: {
          id: 'skill_learner',
          name: '技能达人',
          description: '学会 10 个技能',
          category: 'skill',
          condition: { type: 'skill_count', value: 10 },
          reward: { coins: 100 }
        },
        skill_master: {
          id: 'skill_master',
          name: '技能大师',
          description: '学会所有基础技能',
          category: 'skill',
          condition: { type: 'all_basic_skills', value: true },
          reward: { coins: 300, title: '技能大师' }
        },
        life_expert: {
          id: 'life_expert',
          name: '生活专家',
          description: '学会所有生活技能',
          category: 'skill',
          condition: { type: 'all_life_skills', value: true },
          reward: { coins: 300, title: '生活专家' }
        },
        performance_star: {
          id: 'performance_star',
          name: '表演明星',
          description: '学会所有表演技能',
          category: 'skill',
          condition: { type: 'all_performance_skills', value: true },
          reward: { coins: 300, title: '表演明星' }
        },
        legendary_cat: {
          id: 'legendary_cat',
          name: '传奇猫咪',
          description: '学会传奇技能',
          category: 'skill',
          condition: { type: 'legendary_skill', value: true },
          reward: { coins: 1000, title: '传奇猫咪' }
        }
      },

      // ===== 探索成就 =====
      exploration: {
        first_adventure: {
          id: 'first_adventure',
          name: '初次冒险',
          description: '第一次探索',
          category: 'exploration',
          condition: { type: 'first_explore', value: true },
          reward: { coins: 20 }
        },
        garden_explorer: {
          id: 'garden_explorer',
          name: '花园探索者',
          description: '探索阳光花园',
          category: 'exploration',
          condition: { type: 'scene', value: 'garden' },
          reward: { coins: 50 }
        },
        forest_adventurer: {
          id: 'forest_adventurer',
          name: '森林冒险家',
          description: '探索奇幻森林',
          category: 'exploration',
          condition: { type: 'scene', value: 'forest' },
          reward: { coins: 100 }
        },
        cloud_conqueror: {
          id: 'cloud_conqueror',
          name: '云端征服者',
          description: '探索云端城堡',
          category: 'exploration',
          condition: { type: 'scene', value: 'castle' },
          reward: { coins: 150 }
        },
        world_traveler: {
          id: 'world_traveler',
          name: '世界旅行者',
          description: '探索所有场景',
          category: 'exploration',
          condition: { type: 'all_scenes', value: true },
          reward: { coins: 500, title: '世界旅行者' }
        },
        treasure_hunter: {
          id: 'treasure_hunter',
          name: '宝物猎人',
          description: '发现 10 个宝物',
          category: 'exploration',
          condition: { type: 'treasure_count', value: 10 },
          reward: { coins: 300 }
        }
      },

      // ===== 社交成就 =====
      social: {
        social_beginner: {
          id: 'social_beginner',
          name: '社交新手',
          description: '第一次社交',
          category: 'social',
          condition: { type: 'first_social', value: true },
          reward: { coins: 20 }
        },
        cat_friends: {
          id: 'cat_friends',
          name: '猫咪朋友',
          description: '拥有 3 个猫咪朋友',
          category: 'social',
          condition: { type: 'friend_count', value: 3 },
          reward: { coins: 100 }
        },
        social_star: {
          id: 'social_star',
          name: '社交达人',
          description: '拥有 10 个猫咪朋友',
          category: 'social',
          condition: { type: 'friend_count', value: 10 },
          reward: { coins: 300, title: '社交达人' }
        },
        peace_maker: {
          id: 'peace_maker',
          name: '和平使者',
          description: '化解 5 次冲突',
          category: 'social',
          condition: { type: 'conflict_resolve', value: 5 },
          reward: { coins: 200 }
        },
        party_star: {
          id: 'party_star',
          name: '派对明星',
          description: '参加 10 次派对',
          category: 'social',
          condition: { type: 'party_count', value: 10 },
          reward: { coins: 300 }
        }
      },

      // ===== 羁绊成就 =====
      bond: {
        initial_trust: {
          id: 'initial_trust',
          name: '初步信任',
          description: '羁绊达到 50',
          category: 'bond',
          condition: { type: 'bond', value: 50 },
          reward: { coins: 50 }
        },
        close_partner: {
          id: 'close_partner',
          name: '亲密伙伴',
          description: '羁绊达到 80',
          category: 'bond',
          condition: { type: 'bond', value: 80 },
          reward: { coins: 100 }
        },
        best_mate: {
          id: 'best_mate',
          name: '最佳拍档',
          description: '羁绊达到 100',
          category: 'bond',
          condition: { type: 'bond', value: 100 },
          reward: { coins: 200, title: '最佳拍档' }
        },
        soul_mate: {
          id: 'soul_mate',
          name: '灵魂伴侣',
          description: '羁绊 100 持续 30 天',
          category: 'bond',
          condition: { type: 'bond_maintain', value: 30 },
          reward: { coins: 500, title: '灵魂伴侣' }
        },
        interaction_master: {
          id: 'interaction_master',
          name: '互动达人',
          description: '100 次互动',
          category: 'bond',
          condition: { type: 'interaction_count', value: 100 },
          reward: { coins: 300 }
        },
        long_term_companion: {
          id: 'long_term_companion',
          name: '陪伴最长情',
          description: '连续 30 天互动',
          category: 'bond',
          condition: { type: 'streak', value: 30 },
          reward: { coins: 500, title: '最长情陪伴' }
        }
      },

      // ===== 第一次系列 =====
      first_time: {
        first_meeting: {
          id: 'first_meeting',
          name: '第一次见面',
          description: '与猫咪初次相遇',
          category: 'first_time',
          condition: { type: 'first', value: 'meeting' },
          reward: { coins: 10, exp: 50 }
        },
        first_meal: {
          id: 'first_meal',
          name: '第一顿饭',
          description: '喂猫咪吃第一顿饭',
          category: 'first_time',
          condition: { type: 'first', value: 'meal' },
          reward: { coins: 10 }
        },
        first_play: {
          id: 'first_play',
          name: '第一次玩耍',
          description: '和猫咪第一次玩耍',
          category: 'first_time',
          condition: { type: 'first', value: 'play' },
          reward: { coins: 10 }
        },
        first_sleep: {
          id: 'first_sleep',
          name: '第一次睡觉',
          description: '猫咪第一次睡觉',
          category: 'first_time',
          condition: { type: 'first', value: 'sleep' },
          reward: { coins: 10 }
        },
        first_skill: {
          id: 'first_skill',
          name: '第一个技能',
          description: '猫咪学会第一个技能',
          category: 'first_time',
          condition: { type: 'first', value: 'skill' },
          reward: { coins: 20, exp: 50 }
        },
        first_explore: {
          id: 'first_explore',
          name: '第一次探索',
          description: '猫咪第一次探索',
          category: 'first_time',
          condition: { type: 'first', value: 'explore' },
          reward: { coins: 20 }
        }
      }
    };
  }

  /**
   * 检查成就是否完成
   */
  checkAchievement(achievementId, catStats) {
    const achievement = this.getAchievementById(achievementId);
    if (!achievement) return false;

    const condition = achievement.condition;

    switch (condition.type) {
      case 'days':
        return catStats.days >= condition.value;
      
      case 'streak':
        return catStats.streak >= condition.value;
      
      case 'stage':
        return catStats.stage === condition.value;
      
      case 'skill_count':
        return catStats.skillCount >= condition.value;
      
      case 'all_basic_skills':
        return catStats.allBasicSkills === true;
      
      case 'all_life_skills':
        return catStats.allLifeSkills === true;
      
      case 'all_performance_skills':
        return catStats.allPerformanceSkills === true;
      
      case 'legendary_skill':
        return catStats.hasLegendarySkill === true;
      
      case 'first_explore':
      case 'first_social':
      case 'first':
        return catStats.firstTimes && catStats.firstTimes[condition.value] === true;
      
      case 'scene':
        return catStats.scenes && catStats.scenes.includes(condition.value);
      
      case 'all_scenes':
        return catStats.allScenes === true;
      
      case 'treasure_count':
        return catStats.treasureCount >= condition.value;
      
      case 'friend_count':
        return catStats.friendCount >= condition.value;
      
      case 'conflict_resolve':
        return catStats.conflictResolve >= condition.value;
      
      case 'party_count':
        return catStats.partyCount >= condition.value;
      
      case 'bond':
        return catStats.bond >= condition.value;
      
      case 'bond_maintain':
        return catStats.bond === 100 && catStats.bondDays >= condition.value;
      
      case 'interaction_count':
        return catStats.interactionCount >= condition.value;
      
      default:
        return false;
    }
  }

  /**
   * 获取成就详情
   */
  getAchievementById(achievementId) {
    for (const category of Object.values(this.achievements)) {
      if (category[achievementId]) {
        return category[achievementId];
      }
    }
    return null;
  }

  /**
   * 获取某类别的所有成就
   */
  getAchievementsByCategory(category) {
    return this.achievements[category] || {};
  }

  /**
   * 获取所有成就
   */
  getAllAchievements() {
    const all = [];
    for (const category of Object.values(this.achievements)) {
      for (const achievement of Object.values(category)) {
        all.push(achievement);
      }
    }
    return all;
  }

  /**
   * 检查所有成就
   */
  checkAllAchievements(catStats, unlockedAchievements) {
    const newlyUnlocked = [];
    const allAchievements = this.getAllAchievements();

    for (const achievement of allAchievements) {
      // 如果已经解锁，跳过
      if (unlockedAchievements.includes(achievement.id)) {
        continue;
      }

      // 检查是否完成
      if (this.checkAchievement(achievement.id, catStats)) {
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * 获取成就统计
   */
  getAchievementStats(unlockedAchievements) {
    const all = this.getAllAchievements();
    const total = all.length;
    const unlocked = unlockedAchievements.length;
    const progress = (unlocked / total * 100).toFixed(1);

    // 按类别统计
    const byCategory = {};
    for (const category of Object.keys(this.achievements)) {
      const categoryAchievements = Object.values(this.achievements[category]);
      const categoryUnlocked = categoryAchievements.filter(
        a => unlockedAchievements.includes(a.id)
      ).length;
      
      byCategory[category] = {
        total: categoryAchievements.length,
        unlocked: categoryUnlocked,
        progress: (categoryUnlocked / categoryAchievements.length * 100).toFixed(1)
      };
    }

    return {
      total,
      unlocked,
      progress,
      byCategory
    };
  }

  /**
   * 获取成就类别名称
   */
  getCategoryName(category) {
    const names = {
      growth: '成长',
      skill: '技能',
      exploration: '探索',
      social: '社交',
      bond: '羁绊',
      first_time: '第一次'
    };
    return names[category] || category;
  }
}

module.exports = { AchievementSystem };

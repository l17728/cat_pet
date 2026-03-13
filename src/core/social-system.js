/**
 * 社交系统
 * 
 * 实现云猫世界的完整社交系统：
 * - 猫咪朋友系统
 * - 关系网络
 * - 社交事件
 * - 派对系统
 * - 冲突与和解
 */

class SocialSystem {
  constructor() {
    // 关系类型
    this.relationshipTypes = {
      friend: { name: '朋友', icon: '🐱', bonus: 1.1 },
      best_friend: { name: '挚友', icon: '💕', bonus: 1.3 },
      rival: { name: '对手', icon: '⚔️', bonus: 1.2 },
      mentor: { name: '导师', icon: '🎓', bonus: 1.4 },
      student: { name: '学生', icon: '📚', bonus: 1.1 }
    };

    // 社交事件池
    this.socialEvents = {
      meet_new_friend: {
        id: 'meet_new_friend',
        name: '结识新朋友',
        description: '在广场遇到了新的猫咪朋友',
        expReward: 30,
        coinReward: 20,
        bondChange: 5
      },
      play_together: {
        id: 'play_together',
        name: '一起玩耍',
        description: '和朋友们一起玩耍',
        expReward: 40,
        coinReward: 30,
        bondChange: 8
      },
      share_treasure: {
        id: 'share_treasure',
        name: '分享宝物',
        description: '和朋友分享发现的宝物',
        expReward: 50,
        coinReward: 40,
        bondChange: 10
      },
      conflict: {
        id: 'conflict',
        name: '小冲突',
        description: '和朋友发生了小争执',
        expReward: 10,
        coinReward: 0,
        bondChange: -10
      },
      reconcile: {
        id: 'reconcile',
        name: '和解',
        description: '和朋友和解了',
        expReward: 30,
        coinReward: 20,
        bondChange: 15
      },
      party: {
        id: 'party',
        name: '参加派对',
        description: '参加了猫咪派对',
        expReward: 80,
        coinReward: 60,
        bondChange: 20
      },
      help_friend: {
        id: 'help_friend',
        name: '帮助朋友',
        description: '帮助了遇到困难的朋友',
        expReward: 60,
        coinReward: 40,
        bondChange: 15
      }
    };

    // 派对类型
    this.partyTypes = {
      birthday: { name: '生日派对', expBonus: 2.0, coinBonus: 2.0 },
      celebration: { name: '庆祝派对', expBonus: 1.5, coinBonus: 1.5 },
      gathering: { name: '聚会', expBonus: 1.2, coinBonus: 1.2 },
      festival: { name: '节日派对', expBonus: 1.8, coinBonus: 1.8 }
    };
  }

  /**
   * 初始化社交数据
   */
  initSocialData(catData) {
    catData.friends = [];
    catData.relationships = {};
    catData.socialStats = {
      totalFriends: 0,
      totalInteractions: 0,
      partiesAttended: 0,
      conflictsResolved: 0
    };
    return catData;
  }

  /**
   * 添加朋友
   */
  addFriend(catData, friendCat) {
    if (!catData.friends) {
      catData.friends = [];
    }

    // 检查是否已经是朋友
    const existingFriend = catData.friends.find(f => f.id === friendCat.id);
    if (existingFriend) {
      return {
        success: false,
        error: '已经是朋友了'
      };
    }

    // 添加朋友
    catData.friends.push({
      id: friendCat.id,
      name: friendCat.name,
      metAt: new Date().toISOString(),
      relationship: 'friend',
      friendshipLevel: 1,
      interactions: 0
    });

    // 更新统计
    catData.socialStats.totalFriends = catData.friends.length;

    return {
      success: true,
      friend: friendCat.name,
      totalFriends: catData.friends.length
    };
  }

  /**
   * 移除朋友
   */
  removeFriend(catData, friendId) {
    if (!catData.friends) return { success: false };

    const index = catData.friends.findIndex(f => f.id === friendId);
    if (index === -1) return { success: false };

    catData.friends.splice(index, 1);
    catData.socialStats.totalFriends = catData.friends.length;

    return { success: true };
  }

  /**
   * 提升关系等级
   */
  upgradeRelationship(catData, friendId, newRelationship) {
    const friend = catData.friends.find(f => f.id === friendId);
    if (!friend) return { success: false };

    friend.relationship = newRelationship;
    
    return {
      success: true,
      relationship: this.relationshipTypes[newRelationship]?.name || newRelationship
    };
  }

  /**
   * 增加互动次数
   */
  addInteraction(catData, friendId) {
    const friend = catData.friends.find(f => f.id === friendId);
    if (!friend) return;

    friend.interactions++;
    catData.socialStats.totalInteractions++;

    // 检查是否可以升级关系
    if (friend.interactions >= 10 && friend.relationship === 'friend') {
      this.upgradeRelationship(catData, friendId, 'best_friend');
    }
  }

  /**
   * 触发社交事件
   */
  triggerSocialEvent(catData, eventType) {
    const event = this.socialEvents[eventType];
    if (!event) return { success: false, error: '事件不存在' };

    return {
      success: true,
      event: event.name,
      description: event.description,
      expReward: event.expReward,
      coinReward: event.coinReward,
      bondChange: event.bondChange
    };
  }

  /**
   * 举办派对
   */
  hostParty(catData, partyType, guestList) {
    const party = this.partyTypes[partyType];
    if (!party) return { success: false, error: '派对类型不存在' };

    if (!catData.friends || catData.friends.length === 0) {
      return { success: false, error: '没有朋友可以邀请' };
    }

    // 计算奖励
    const guestCount = Math.min(guestList.length, catData.friends.length);
    const expReward = 50 * guestCount * party.expBonus;
    const coinReward = 30 * guestCount * party.coinBonus;

    // 更新统计
    catData.socialStats.partiesAttended++;

    // 增加所有客人的友谊
    guestList.forEach(guestId => {
      this.addInteraction(catData, guestId);
    });

    return {
      success: true,
      party: party.name,
      guests: guestCount,
      expReward,
      coinReward,
      message: `成功举办了${party.name}，邀请了${guestCount}位朋友！`
    };
  }

  /**
   * 解决冲突
   */
  resolveConflict(catData, friendId) {
    const friend = catData.friends.find(f => f.id === friendId);
    if (!friend) return { success: false };

    // 触发和解事件
    const result = this.triggerSocialEvent(catData, 'reconcile');
    
    // 更新统计
    catData.socialStats.conflictsResolved++;

    return {
      success: true,
      ...result,
      message: `和${friend.name}和解了！`
    };
  }

  /**
   * 获取社交统计
   */
  getSocialStats(catData) {
    return {
      totalFriends: catData.socialStats?.totalFriends || 0,
      totalInteractions: catData.socialStats?.totalInteractions || 0,
      partiesAttended: catData.socialStats?.partiesAttended || 0,
      conflictsResolved: catData.socialStats?.conflictsResolved || 0,
      friends: catData.friends || [],
      relationshipTypes: this.relationshipTypes
    };
  }

  /**
   * 检查社交成就
   */
  checkSocialAchievements(catData) {
    const achievements = [];
    const stats = catData.socialStats;

    // 朋友数量成就
    if (stats.totalFriends >= 3) {
      achievements.push('cat_friends');
    }
    if (stats.totalFriends >= 10) {
      achievements.push('social_star');
    }

    // 互动成就
    if (stats.totalInteractions >= 10) {
      achievements.push('social_beginner');
    }
    if (stats.totalInteractions >= 50) {
      achievements.push('social_star');
    }

    // 派对成就
    if (stats.partiesAttended >= 10) {
      achievements.push('party_star');
    }

    // 冲突解决成就
    if (stats.conflictsResolved >= 5) {
      achievements.push('peace_maker');
    }

    return achievements;
  }

  /**
   * 获取朋友列表
   */
  getFriends(catData) {
    return catData.friends || [];
  }

  /**
   * 获取挚友列表
   */
  getBestFriends(catData) {
    return (catData.friends || []).filter(f => f.relationship === 'best_friend');
  }

  /**
   * 检查是否有朋友
   */
  hasFriends(catData) {
    return catData.friends && catData.friends.length > 0;
  }

  /**
   * 检查是否有挚友
   */
  hasBestFriend(catData) {
    return (catData.friends || []).some(f => f.relationship === 'best_friend');
  }
}

module.exports = { SocialSystem };

<template>
  <view class="profile-page">
    <!-- 用户信息头部 -->
    <view class="profile-header">
      <view class="header-bg">
        <image 
          class="bg-image" 
          :src="userInfo.backgroundImage || '/static/images/default-bg.jpg'" 
          mode="aspectFill"
        ></image>
        <view class="header-overlay"></view>
      </view>
      
      <view class="user-info">
        <view class="avatar-section">
          <image 
            class="user-avatar" 
            :src="userInfo.avatar" 
            mode="aspectFill"
            @click="previewAvatar"
          ></image>
          <button class="edit-profile-btn" @click="editProfile">
            <uni-icons type="compose" size="16" color="white"></uni-icons>
          </button>
        </view>
        
        <view class="user-details">
          <text class="username">{{ userInfo.nickname }}</text>
          <text class="user-id">ID: {{ userInfo.id }}</text>
          <text class="bio" v-if="userInfo.bio">{{ userInfo.bio }}</text>
          
          <view class="user-stats">
            <view class="stat-item" @click="showFollowList('following')">
              <text class="stat-number">{{ userInfo.followingCount || 0 }}</text>
              <text class="stat-label">关注</text>
            </view>
            <view class="stat-item" @click="showFollowList('followers')">
              <text class="stat-number">{{ userInfo.followersCount || 0 }}</text>
              <text class="stat-label">粉丝</text>
            </view>
            <view class="stat-item">
              <text class="stat-number">{{ userInfo.postsCount || 0 }}</text>
              <text class="stat-label">动态</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-grid">
        <view class="menu-item" @click="goToPage('/pages/myPosts/myPosts')">
          <uni-icons type="chatboxes-filled" size="24" color="#007AFF"></uni-icons>
          <text class="menu-text">我的动态</text>
        </view>
        <view class="menu-item" @click="goToPage('/pages/favorites/favorites')">
          <uni-icons type="heart-filled" size="24" color="#FF3B30"></uni-icons>
          <text class="menu-text">我的收藏</text>
        </view>
        <view class="menu-item" @click="goToPage('/pages/drafts/drafts')">
          <uni-icons type="compose" size="24" color="#34C759"></uni-icons>
          <text class="menu-text">草稿箱</text>
        </view>
        <view class="menu-item" @click="goToPage('/pages/history/history')">
          <uni-icons type="clock" size="24" color="#FF9500"></uni-icons>
          <text class="menu-text">浏览历史</text>
        </view>
      </view>
    </view>

    <!-- 设置列表 -->
    <view class="settings-section">
      <view class="settings-list">
        <view class="setting-item" @click="goToPage('/pages/privacy/privacy')">
          <uni-icons type="locked" size="20" color="#666"></uni-icons>
          <text class="setting-text">隐私设置</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        
        <view class="setting-item" @click="goToPage('/pages/notification/notification')">
          <uni-icons type="sound" size="20" color="#666"></uni-icons>
          <text class="setting-text">消息通知</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        
        <view class="setting-item" @click="goToPage('/pages/theme/theme')">
          <uni-icons type="color" size="20" color="#666"></uni-icons>
          <text class="setting-text">主题设置</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        
        <view class="setting-item" @click="goToPage('/pages/about/about')">
          <uni-icons type="info" size="20" color="#666"></uni-icons>
          <text class="setting-text">关于我们</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        
        <view class="setting-item" @click="feedback">
          <uni-icons type="chatbubble" size="20" color="#666"></uni-icons>
          <text class="setting-text">意见反馈</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        
        <view class="setting-item" @click="clearCache">
          <uni-icons type="trash" size="20" color="#666"></uni-icons>
          <text class="setting-text">清理缓存</text>
          <text class="cache-size">{{ cacheSize }}</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">版本 {{ version }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProfilePage',
  data() {
    return {
      userInfo: {},
      cacheSize: '0MB',
      version: '1.0.0'
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.calculateCacheSize()
  },
  onShow() {
    // 每次显示时刷新用户信息
    this.loadUserInfo()
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
        // 获取最新的用户统计信息
        this.loadUserStats()
      } else {
        // 未登录，跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    },

    // 加载用户统计信息
    async loadUserStats() {
      try {
        const stats = await this.mockGetUserStats(this.userInfo.id)
        this.userInfo = { ...this.userInfo, ...stats }
      } catch (error) {
        console.error('加载用户统计失败:', error)
      }
    },

    // 预览头像
    previewAvatar() {
      uni.previewImage({
        urls: [this.userInfo.avatar],
        current: 0
      })
    },

    // 编辑资料
    editProfile() {
      uni.navigateTo({
        url: '/pages/editProfile/editProfile'
      })
    },

    // 显示关注/粉丝列表
    showFollowList(type) {
      uni.navigateTo({
        url: `/pages/followList/followList?type=${type}&userId=${this.userInfo.id}`
      })
    },

    // 跳转到指定页面
    goToPage(url) {
      uni.navigateTo({
        url: url,
        fail: (error) => {
          console.error('页面跳转失败:', error)
          uni.showToast({
            title: '功能开发中',
            icon: 'none'
          })
        }
      })
    },

    // 意见反馈
    feedback() {
      uni.showActionSheet({
        itemList: ['问题反馈', '功能建议', '联系客服'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.reportProblem()
              break
            case 1:
              this.suggestFeature()
              break
            case 2:
              this.contactService()
              break
          }
        }
      })
    },

    // 问题反馈
    reportProblem() {
      uni.navigateTo({
        url: '/pages/feedback/feedback?type=problem'
      })
    },

    // 功能建议
    suggestFeature() {
      uni.navigateTo({
        url: '/pages/feedback/feedback?type=suggestion'
      })
    },

    // 联系客服
    contactService() {
      uni.showModal({
        title: '联系客服',
        content: '客服微信：social_service\n工作时间：9:00-18:00',
        confirmText: '复制微信号',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: 'social_service',
              success: () => {
                uni.showToast({
                  title: '微信号已复制',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },

    // 清理缓存
    clearCache() {
      uni.showModal({
        title: '清理缓存',
        content: `当前缓存大小：${this.cacheSize}\n确定要清理缓存吗？`,
        success: (res) => {
          if (res.confirm) {
            this.performClearCache()
          }
        }
      })
    },

    // 执行清理缓存
    async performClearCache() {
      try {
        // 清理图片缓存
        await uni.clearStorage()
        
        // 重新保存必要的数据
        const userInfo = this.userInfo
        const token = uni.getStorageSync('token')
        
        if (token) uni.setStorageSync('token', token)
        if (userInfo) uni.setStorageSync('userInfo', userInfo)
        
        this.cacheSize = '0MB'
        
        uni.showToast({
          title: '缓存清理完成',
          icon: 'success'
        })
      } catch (error) {
        console.error('清理缓存失败:', error)
        uni.showToast({
          title: '清理失败',
          icon: 'none'
        })
      }
    },

    // 计算缓存大小
    calculateCacheSize() {
      // 模拟计算缓存大小
      const randomSize = Math.floor(Math.random() * 50) + 10
      this.cacheSize = `${randomSize}MB`
    },

    // 退出登录
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.performLogout()
          }
        }
      })
    },

    // 执行退出登录
    performLogout() {
      // 清除登录信息
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      
      // 清除其他用户相关数据
      uni.removeStorageSync('publishDraft')
      
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      })
      
      // 跳转到登录页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }, 1500)
    },

    // 模拟API - 获取用户统计信息
    mockGetUserStats(userId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            followingCount: Math.floor(Math.random() * 500) + 50,
            followersCount: Math.floor(Math.random() * 1000) + 100,
            postsCount: Math.floor(Math.random() * 200) + 20
          })
        }, 500)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-header {
  position: relative;
  background-color: white;
  margin-bottom: 20rpx;
}

.header-bg {
  position: relative;
  height: 300rpx;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  height: 100%;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
}

.user-info {
  position: relative;
  padding: 0 30rpx 40rpx;
  margin-top: -80rpx;
}

.avatar-section {
  position: relative;
  display: flex;
  align-items: flex-end;
  margin-bottom: 30rpx;
}

.user-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid white;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.edit-profile-btn {
  position: absolute;
  right: 0;
  bottom: 10rpx;
  width: 60rpx;
  height: 60rpx;
  background-color: #007AFF;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.3);
}

.user-details {
  flex: 1;
}

.username {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 16rpx;
}

.bio {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 30rpx;
}

.user-stats {
  display: flex;
  gap: 60rpx;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.menu-section {
  background-color: white;
  border-radius: 16rpx;
  margin: 0 20rpx 20rpx;
  padding: 30rpx;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40rpx;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.menu-text {
  font-size: 24rpx;
  color: #333;
  margin-top: 16rpx;
}

.settings-section {
  background-color: white;
  border-radius: 16rpx;
  margin: 0 20rpx 20rpx;
  overflow: hidden;
}

.settings-list {
  padding: 0 30rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  margin-left: 20rpx;
}

.cache-size {
  font-size: 26rpx;
  color: #999;
  margin-right: 10rpx;
}

.logout-section {
  margin: 0 20rpx 20rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background-color: #FF3B30;
  color: white;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
}

.version-info {
  text-align: center;
  padding: 40rpx 0;
}

.version-text {
  font-size: 24rpx;
  color: #999;
}
</style>
<template>
  <view class="discover-page">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar" @click="goToSearch">
        <uni-icons type="search" size="20" color="#999"></uni-icons>
        <text class="search-placeholder">搜索话题、用户...</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view 
      class="content" 
      scroll-y="true"
      refresher-enabled="true"
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <!-- 热门话题 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">热门话题</text>
          <text class="section-more" @click="showAllTopics">查看更多</text>
        </view>
        
        <scroll-view class="topics-scroll" scroll-x="true" show-scrollbar="false">
          <view class="topics-list">
            <view 
              class="topic-card"
              v-for="topic in hotTopics"
              :key="topic.id"
              @click="goToTopic(topic.id)"
            >
              <image class="topic-image" :src="topic.image" mode="aspectFill"></image>
              <view class="topic-info">
                <text class="topic-name">#{{ topic.name }}</text>
                <text class="topic-count">{{ formatCount(topic.count) }}人参与</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 推荐用户 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">推荐关注</text>
          <text class="section-more" @click="showAllUsers">查看更多</text>
        </view>
        
        <view class="users-grid">
          <view 
            class="user-card"
            v-for="user in recommendUsers"
            :key="user.id"
            @click="goToUserProfile(user.id)"
          >
            <image class="user-avatar" :src="user.avatar" mode="aspectFill"></image>
            <text class="user-nickname">{{ user.nickname }}</text>
            <text class="user-desc">{{ user.desc }}</text>
            <button 
              class="follow-btn"
              :class="{ 'followed': user.isFollowed }"
              @click.stop="toggleFollow(user)"
            >
              {{ user.isFollowed ? '已关注' : '关注' }}
            </button>
          </view>
        </view>
      </view>

      <!-- 精选动态 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">精选动态</text>
        </view>
        
        <view class="featured-posts">
          <view 
            class="post-card"
            v-for="post in featuredPosts"
            :key="post.id"
            @click="goToDetail(post.id)"
          >
            <view class="post-header">
              <image class="post-avatar" :src="post.user.avatar" mode="aspectFill"></image>
              <view class="post-user-info">
                <text class="post-username">{{ post.user.nickname }}</text>
                <text class="post-time">{{ formatTime(post.createTime) }}</text>
              </view>
            </view>
            
            <text class="post-content">{{ post.content }}</text>
            
            <view class="post-images" v-if="post.images && post.images.length > 0">
              <image 
                class="post-image"
                v-for="(image, index) in post.images.slice(0, 3)"
                :key="index"
                :src="image"
                mode="aspectFill"
                @click.stop="previewImage(post.images, index)"
              ></image>
              <view class="more-images" v-if="post.images.length > 3">
                <text class="more-count">+{{ post.images.length - 3 }}</text>
              </view>
            </view>
            
            <view class="post-stats">
              <view class="stat-item">
                <uni-icons type="heart" size="16" color="#999"></uni-icons>
                <text class="stat-text">{{ post.likeCount || 0 }}</text>
              </view>
              <view class="stat-item">
                <uni-icons type="chat" size="16" color="#999"></uni-icons>
                <text class="stat-text">{{ post.commentCount || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 附近的人 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">附近的人</text>
          <text class="section-more" @click="showNearbyUsers">查看更多</text>
        </view>
        
        <view class="nearby-users">
          <view 
            class="nearby-user"
            v-for="user in nearbyUsers"
            :key="user.id"
            @click="goToUserProfile(user.id)"
          >
            <image class="nearby-avatar" :src="user.avatar" mode="aspectFill"></image>
            <view class="nearby-info">
              <text class="nearby-name">{{ user.nickname }}</text>
              <text class="nearby-distance">距离{{ user.distance }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'DiscoverPage',
  data() {
    return {
      refreshing: false,
      hotTopics: [],
      recommendUsers: [],
      featuredPosts: [],
      nearbyUsers: []
    }
  },
  onLoad() {
    this.loadDiscoverData()
  },
  onShow() {
    // 每次显示时刷新数据
    this.loadDiscoverData()
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    // 加载发现页数据
    async loadDiscoverData() {
      try {
        const [topics, users, posts, nearby] = await Promise.all([
          this.mockGetHotTopics(),
          this.mockGetRecommendUsers(),
          this.mockGetFeaturedPosts(),
          this.mockGetNearbyUsers()
        ])
        
        this.hotTopics = topics
        this.recommendUsers = users
        this.featuredPosts = posts
        this.nearbyUsers = nearby
      } catch (error) {
        console.error('加载发现页数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    // 刷新数据
    async onRefresh() {
      this.refreshing = true
      await this.loadDiscoverData()
      this.refreshing = false
      uni.stopPullDownRefresh()
    },

    // 关注/取消关注用户
    async toggleFollow(user) {
      try {
        const isFollowed = !user.isFollowed
        await this.mockToggleFollow(user.id, isFollowed)
        
        user.isFollowed = isFollowed
        
        uni.showToast({
          title: isFollowed ? '关注成功' : '已取消关注',
          icon: 'success',
          duration: 1000
        })
      } catch (error) {
        console.error('关注操作失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    // 预览图片
    previewImage(images, current) {
      uni.previewImage({
        urls: images,
        current: current
      })
    },

    // 跳转到搜索页面
    goToSearch() {
      uni.navigateTo({
        url: '/pages/search/search'
      })
    },

    // 跳转到话题页面
    goToTopic(topicId) {
      uni.navigateTo({
        url: `/pages/topic/topic?id=${topicId}`
      })
    },

    // 跳转到用户资料页
    goToUserProfile(userId) {
      uni.navigateTo({
        url: `/pages/userProfile/userProfile?userId=${userId}`
      })
    },

    // 跳转到动态详情
    goToDetail(postId) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${postId}`
      })
    },

    // 显示所有话题
    showAllTopics() {
      uni.navigateTo({
        url: '/pages/topicList/topicList'
      })
    },

    // 显示所有推荐用户
    showAllUsers() {
      uni.navigateTo({
        url: '/pages/recommendUsers/recommendUsers'
      })
    },

    // 显示附近的人
    showNearbyUsers() {
      uni.navigateTo({
        url: '/pages/nearbyUsers/nearbyUsers'
      })
    },

    // 格式化数量
    formatCount(count) {
      if (count < 1000) return count.toString()
      if (count < 10000) return (count / 1000).toFixed(1) + 'K'
      return (count / 10000).toFixed(1) + 'W'
    },

    // 格式化时间
    formatTime(timestamp) {
      const now = Date.now()
      const diff = now - timestamp
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour

      if (diff < minute) {
        return '刚刚'
      } else if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`
      } else if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`
      } else {
        return `${Math.floor(diff / day)}天前`
      }
    },

    // 模拟API - 获取热门话题
    mockGetHotTopics() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const topics = [
            { id: 1, name: '日常生活', count: 12580, image: 'https://picsum.photos/200/120?random=1' },
            { id: 2, name: '美食分享', count: 8960, image: 'https://picsum.photos/200/120?random=2' },
            { id: 3, name: '旅行记录', count: 7320, image: 'https://picsum.photos/200/120?random=3' },
            { id: 4, name: '摄影', count: 6540, image: 'https://picsum.photos/200/120?random=4' },
            { id: 5, name: '健身打卡', count: 5890, image: 'https://picsum.photos/200/120?random=5' }
          ]
          resolve(topics)
        }, 500)
      })
    },

    // 模拟API - 获取推荐用户
    mockGetRecommendUsers() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const users = []
          for (let i = 1; i <= 6; i++) {
            users.push({
              id: i,
              nickname: `推荐用户${i}`,
              avatar: `https://picsum.photos/100/100?random=${i + 10}`,
              desc: `这是用户${i}的简介`,
              isFollowed: Math.random() > 0.7
            })
          }
          resolve(users)
        }, 500)
      })
    },

    // 模拟API - 获取精选动态
    mockGetFeaturedPosts() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const posts = []
          for (let i = 1; i <= 5; i++) {
            posts.push({
              id: i,
              content: `这是第${i}条精选动态，内容非常精彩！`,
              images: Math.random() > 0.5 ? [
                `https://picsum.photos/300/200?random=${i + 20}`,
                `https://picsum.photos/300/200?random=${i + 30}`
              ] : [],
              createTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
              likeCount: Math.floor(Math.random() * 500) + 100,
              commentCount: Math.floor(Math.random() * 100) + 20,
              user: {
                id: i,
                nickname: `精选用户${i}`,
                avatar: `https://picsum.photos/100/100?random=${i + 40}`
              }
            })
          }
          resolve(posts)
        }, 500)
      })
    },

    // 模拟API - 获取附近的人
    mockGetNearbyUsers() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const users = []
          for (let i = 1; i <= 4; i++) {
            users.push({
              id: i + 100,
              nickname: `附近用户${i}`,
              avatar: `https://picsum.photos/100/100?random=${i + 50}`,
              distance: `${Math.floor(Math.random() * 1000) + 100}m`
            })
          }
          resolve(users)
        }, 500)
      })
    },

    // 模拟API - 关注操作
    mockToggleFollow(userId, isFollowed) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 300)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.discover-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.search-section {
  background-color: white;
  padding: 20rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
}

.search-placeholder {
  margin-left: 16rpx;
  color: #999;
  font-size: 28rpx;
}

.content {
  flex: 1;
  padding: 20rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #007AFF;
}

.topics-scroll {
  white-space: nowrap;
}

.topics-list {
  display: inline-flex;
  gap: 20rpx;
}

.topic-card {
  width: 240rpx;
  background-color: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.topic-image {
  width: 100%;
  height: 120rpx;
}

.topic-info {
  padding: 20rpx;
}

.topic-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.topic-count {
  font-size: 24rpx;
  color: #999;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.user-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
}

.user-nickname {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.user-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 20rpx;
}

.follow-btn {
  width: 120rpx;
  height: 60rpx;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.follow-btn.followed {
  background-color: #f0f0f0;
  color: #666;
}

.featured-posts {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.post-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.post-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.post-user-info {
  flex: 1;
}

.post-username {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
}

.post-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.post-content {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 20rpx;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.post-image {
  aspect-ratio: 1;
  border-radius: 8rpx;
}

.more-images {
  aspect-ratio: 1;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-count {
  color: white;
  font-size: 24rpx;
}

.post-stats {
  display: flex;
  gap: 40rpx;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-text {
  font-size: 24rpx;
  color: #999;
  margin-left: 8rpx;
}

.nearby-users {
  background-color: white;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.nearby-user {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.nearby-user:last-child {
  border-bottom: none;
}

.nearby-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.nearby-info {
  flex: 1;
}

.nearby-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.nearby-distance {
  font-size: 24rpx;
  color: #999;
}
</style>
<template>
  <view class="user-profile-page">
    <scroll-view 
      class="content" 
      scroll-y="true"
      refresher-enabled="true"
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <!-- 用户信息头部 -->
      <view class="profile-header">
        <view class="header-bg">
          <image 
            class="bg-image" 
            :src="userProfile.backgroundImage || '/static/images/default-bg.jpg'" 
            mode="aspectFill"
          ></image>
          <view class="header-overlay"></view>
        </view>
        
        <view class="user-info">
          <view class="avatar-section">
            <image 
              class="user-avatar" 
              :src="userProfile.avatar" 
              mode="aspectFill"
              @click="previewAvatar"
            ></image>
          </view>
          
          <view class="user-details">
            <text class="username">{{ userProfile.nickname }}</text>
            <text class="user-id">ID: {{ userProfile.id }}</text>
            <text class="bio" v-if="userProfile.bio">{{ userProfile.bio }}</text>
            
            <view class="user-stats">
              <view class="stat-item" @click="showFollowList('following')">
                <text class="stat-number">{{ userProfile.followingCount || 0 }}</text>
                <text class="stat-label">关注</text>
              </view>
              <view class="stat-item" @click="showFollowList('followers')">
                <text class="stat-number">{{ userProfile.followersCount || 0 }}</text>
                <text class="stat-label">粉丝</text>
              </view>
              <view class="stat-item">
                <text class="stat-number">{{ userProfile.postsCount || 0 }}</text>
                <text class="stat-label">动态</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons" v-if="userProfile.id !== currentUserId">
          <button 
            class="follow-btn"
            :class="{ followed: userProfile.isFollowed }"
            @click="toggleFollow"
          >
            {{ userProfile.isFollowed ? '已关注' : '关注' }}
          </button>
          
          <button class="message-btn" @click="sendMessage">
            <uni-icons type="chat" size="16" color="white"></uni-icons>
            <text class="btn-text">私信</text>
          </button>
          
          <button class="more-btn" @click="showMoreActions">
            <uni-icons type="more" size="16" color="#666"></uni-icons>
          </button>
        </view>
      </view>

      <!-- 内容切换标签 -->
      <view class="content-tabs">
        <view 
          class="tab-item"
          :class="{ active: activeTab === 'posts' }"
          @click="switchTab('posts')"
        >
          <text class="tab-text">动态</text>
        </view>
        <view 
          class="tab-item"
          :class="{ active: activeTab === 'media' }"
          @click="switchTab('media')"
        >
          <text class="tab-text">图片</text>
        </view>
        <view 
          class="tab-item"
          :class="{ active: activeTab === 'likes' }"
          @click="switchTab('likes')"
        >
          <text class="tab-text">点赞</text>
        </view>
      </view>

      <!-- 动态列表 -->
      <view class="posts-section" v-if="activeTab === 'posts'">
        <view 
          class="post-item"
          v-for="post in userPosts"
          :key="post.id"
          @click="goToDetail(post.id)"
        >
          <view class="post-header">
            <text class="post-time">{{ formatTime(post.createTime) }}</text>
            <view class="post-actions" @click.stop="showPostActions(post)">
              <uni-icons type="more" size="16" color="#999"></uni-icons>
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
              <uni-icons type="heart" size="14" color="#999"></uni-icons>
              <text class="stat-text">{{ post.likeCount || 0 }}</text>
            </view>
            <view class="stat-item">
              <uni-icons type="chat" size="14" color="#999"></uni-icons>
              <text class="stat-text">{{ post.commentCount || 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 图片网格 -->
      <view class="media-section" v-if="activeTab === 'media'">
        <view class="media-grid">
          <view 
            class="media-item"
            v-for="(image, index) in mediaList"
            :key="index"
            @click="previewImage(mediaList, index)"
          >
            <image :src="image" mode="aspectFill"></image>
          </view>
        </view>
      </view>

      <!-- 点赞列表 -->
      <view class="likes-section" v-if="activeTab === 'likes'">
        <view 
          class="like-item"
          v-for="like in likedPosts"
          :key="like.id"
          @click="goToDetail(like.id)"
        >
          <view class="like-content">
            <text class="like-text">{{ like.content }}</text>
            <text class="like-time">{{ formatTime(like.likeTime) }}</text>
          </view>
          <image 
            class="like-image" 
            :src="like.images && like.images[0]" 
            mode="aspectFill"
            v-if="like.images && like.images.length > 0"
          ></image>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore">
        <uni-load-more :status="loadStatus"></uni-load-more>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'UserProfilePage',
  data() {
    return {
      userId: null,
      userProfile: {},
      currentUserId: null,
      refreshing: false,
      activeTab: 'posts', // posts, media, likes
      
      // 内容数据
      userPosts: [],
      mediaList: [],
      likedPosts: [],
      
      // 分页
      hasMore: true,
      loadStatus: 'more',
      currentPage: 1
    }
  },
  onLoad(options) {
    this.userId = options.userId
    this.getCurrentUser()
    this.loadUserProfile()
    this.loadContent()
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    // 获取当前用户信息
    getCurrentUser() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.currentUserId = userInfo.id
      }
    },

    // 加载用户资料
    async loadUserProfile() {
      try {
        this.userProfile = await this.mockGetUserProfile(this.userId)
      } catch (error) {
        console.error('加载用户资料失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    // 加载内容
    async loadContent(refresh = false) {
      if (refresh) {
        this.currentPage = 1
        this.hasMore = true
      }

      try {
        switch (this.activeTab) {
          case 'posts':
            await this.loadUserPosts(refresh)
            break
          case 'media':
            await this.loadMediaList(refresh)
            break
          case 'likes':
            await this.loadLikedPosts(refresh)
            break
        }
      } catch (error) {
        console.error('加载内容失败:', error)
      }
    },

    // 刷新数据
    async onRefresh() {
      this.refreshing = true
      await Promise.all([
        this.loadUserProfile(),
        this.loadContent(true)
      ])
      this.refreshing = false
      uni.stopPullDownRefresh()
    },

    // 加载更多
    loadMore() {
      if (this.hasMore && this.loadStatus !== 'loading') {
        this.loadContent()
      }
    },

    // 切换标签
    switchTab(tab) {
      if (this.activeTab !== tab) {
        this.activeTab = tab
        this.loadContent(true)
      }
    },

    // 加载用户动态
    async loadUserPosts(refresh = false) {
      this.loadStatus = 'loading'
      
      try {
        const posts = await this.mockGetUserPosts(this.userId, this.currentPage)
        
        if (refresh) {
          this.userPosts = posts
        } else {
          this.userPosts = [...this.userPosts, ...posts]
        }

        this.hasMore = posts.length === 10
        this.currentPage++
        this.loadStatus = this.hasMore ? 'more' : 'noMore'
      } catch (error) {
        this.loadStatus = 'more'
        throw error
      }
    },

    // 加载媒体列表
    async loadMediaList(refresh = false) {
      this.loadStatus = 'loading'
      
      try {
        const media = await this.mockGetUserMedia(this.userId, this.currentPage)
        
        if (refresh) {
          this.mediaList = media
        } else {
          this.mediaList = [...this.mediaList, ...media]
        }

        this.hasMore = media.length === 20
        this.currentPage++
        this.loadStatus = this.hasMore ? 'more' : 'noMore'
      } catch (error) {
        this.loadStatus = 'more'
        throw error
      }
    },

    // 加载点赞列表
    async loadLikedPosts(refresh = false) {
      this.loadStatus = 'loading'
      
      try {
        const likes = await this.mockGetLikedPosts(this.userId, this.currentPage)
        
        if (refresh) {
          this.likedPosts = likes
        } else {
          this.likedPosts = [...this.likedPosts, ...likes]
        }

        this.hasMore = likes.length === 10
        this.currentPage++
        this.loadStatus = this.hasMore ? 'more' : 'noMore'
      } catch (error) {
        this.loadStatus = 'more'
        throw error
      }
    },

    // 关注/取消关注
    async toggleFollow() {
      try {
        const isFollowed = !this.userProfile.isFollowed
        await this.mockToggleFollow(this.userId, isFollowed)
        
        this.userProfile.isFollowed = isFollowed
        this.userProfile.followersCount = isFollowed ? 
          (this.userProfile.followersCount || 0) + 1 : 
          (this.userProfile.followersCount || 1) - 1
        
        uni.showToast({
          title: isFollowed ? '关注成功' : '已取消关注',
          icon: 'success'
        })
      } catch (error) {
        console.error('关注操作失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    // 发送私信
    sendMessage() {
      uni.navigateTo({
        url: `/pages/chat/chat?userId=${this.userId}&name=${this.userProfile.nickname}&avatar=${this.userProfile.avatar}`
      })
    },

    // 显示更多操作
    showMoreActions() {
      const actions = ['举报用户', '拉黑用户']
      
      uni.showActionSheet({
        itemList: actions,
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.reportUser()
              break
            case 1:
              this.blockUser()
              break
          }
        }
      })
    },

    // 举报用户
    reportUser() {
      uni.showModal({
        title: '举报用户',
        content: '确定要举报该用户吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '举报成功',
              icon: 'success'
            })
          }
        }
      })
    },

    // 拉黑用户
    blockUser() {
      uni.showModal({
        title: '拉黑用户',
        content: '拉黑后将不再看到该用户的动态',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已拉黑',
              icon: 'success'
            })
          }
        }
      })
    },

    // 显示动态操作
    showPostActions(post) {
      const actions = ['分享', '举报']
      
      uni.showActionSheet({
        itemList: actions,
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.sharePost(post)
              break
            case 1:
              this.reportPost(post)
              break
          }
        }
      })
    },

    // 分享动态
    sharePost(post) {
      uni.showToast({
        title: '分享成功',
        icon: 'success'
      })
    },

    // 举报动态
    reportPost(post) {
      uni.showToast({
        title: '举报成功',
        icon: 'success'
      })
    },

    // 显示关注/粉丝列表
    showFollowList(type) {
      uni.navigateTo({
        url: `/pages/followList/followList?type=${type}&userId=${this.userId}`
      })
    },

    // 预览头像
    previewAvatar() {
      uni.previewImage({
        urls: [this.userProfile.avatar],
        current: 0
      })
    },

    // 预览图片
    previewImage(images, current) {
      uni.previewImage({
        urls: images,
        current: current
      })
    },

    // 跳转到动态详情
    goToDetail(postId) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${postId}`
      })
    },

    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date

      if (diff < 24 * 60 * 60 * 1000) {
        // 24小时内显示相对时间
        const hours = Math.floor(diff / (60 * 60 * 1000))
        const minutes = Math.floor(diff / (60 * 1000))
        
        if (hours > 0) {
          return `${hours}小时前`
        } else if (minutes > 0) {
          return `${minutes}分钟前`
        } else {
          return '刚刚'
        }
      } else {
        // 超过24小时显示具体日期
        return `${date.getMonth() + 1}-${date.getDate()}`
      }
    },

    // 模拟API - 获取用户资料
    mockGetUserProfile(userId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: userId,
            nickname: `用户${userId}`,
            avatar: `https://picsum.photos/200/200?random=${userId}`,
            backgroundImage: `https://picsum.photos/800/400?random=${userId + 100}`,
            bio: '这是一个有趣的人，喜欢分享生活中的美好时刻。',
            followingCount: Math.floor(Math.random() * 500) + 50,
            followersCount: Math.floor(Math.random() * 1000) + 100,
            postsCount: Math.floor(Math.random() * 200) + 20,
            isFollowed: Math.random() > 0.5
          })
        }, 500)
      })
    },

    // 模拟API - 获取用户动态
    mockGetUserPosts(userId, page) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const posts = []
          for (let i = 1; i <= 10; i++) {
            const postId = (page - 1) * 10 + i
            posts.push({
              id: postId,
              content: `用户${userId}的第${postId}条动态内容`,
              images: Math.random() > 0.5 ? [
                `https://picsum.photos/300/300?random=${postId}`,
                `https://picsum.photos/300/300?random=${postId + 1000}`
              ] : [],
              createTime: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
              likeCount: Math.floor(Math.random() * 100),
              commentCount: Math.floor(Math.random() * 50)
            })
          }
          resolve(posts)
        }, 500)
      })
    },

    // 模拟API - 获取用户媒体
    mockGetUserMedia(userId, page) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const media = []
          for (let i = 1; i <= 20; i++) {
            const mediaId = (page - 1) * 20 + i
            media.push(`https://picsum.photos/300/300?random=${mediaId + 2000}`)
          }
          resolve(media)
        }, 500)
      })
    },

    // 模拟API - 获取点赞列表
    mockGetLikedPosts(userId, page) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const likes = []
          for (let i = 1; i <= 10; i++) {
            const likeId = (page - 1) * 10 + i
            likes.push({
              id: likeId,
              content: `点赞的第${likeId}条动态内容`,
              images: Math.random() > 0.7 ? [
                `https://picsum.photos/300/300?random=${likeId + 3000}`
              ] : [],
              likeTime: Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000
            })
          }
          resolve(likes)
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
.user-profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content {
  height: 100vh;
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
  padding: 0 30rpx 30rpx;
  margin-top: -80rpx;
}

.avatar-section {
  margin-bottom: 30rpx;
}

.user-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid white;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.user-details {
  margin-bottom: 30rpx;
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

.action-buttons {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx 30rpx;
}

.follow-btn {
  flex: 1;
  height: 70rpx;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 35rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.follow-btn.followed {
  background-color: #f0f0f0;
  color: #666;
}

.message-btn {
  flex: 1;
  height: 70rpx;
  background-color: #34C759;
  color: white;
  border: none;
  border-radius: 35rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.btn-text {
  font-size: 28rpx;
}

.more-btn {
  width: 70rpx;
  height: 70rpx;
  background-color: #f0f0f0;
  border: none;
  border-radius: 35rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-tabs {
  display: flex;
  background-color: white;
  border-bottom: 1rpx solid #e5e5e5;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-item.active {
  color: #007AFF;
  border-bottom: 4rpx solid #007AFF;
}

.tab-text {
  font-size: 30rpx;
  font-weight: 500;
}

.posts-section {
  background-color: white;
  padding: 0 30rpx;
}

.post-item {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.post-item:last-child {
  border-bottom: none;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.post-actions {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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
  gap: 8rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #999;
}

.media-section {
  background-color: white;
  padding: 20rpx;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rpx;
}

.media-item {
  aspect-ratio: 1;
}

.media-item image {
  width: 100%;
  height: 100%;
}

.likes-section {
  background-color: white;
  padding: 0 30rpx;
}

.like-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.like-item:last-child {
  border-bottom: none;
}

.like-content {
  flex: 1;
  margin-right: 20rpx;
}

.like-text {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.like-time {
  font-size: 24rpx;
  color: #999;
}

.like-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
}

.load-more {
  padding: 30rpx;
}
</style>
<template>
  <view class="index-page">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input" @click="goToSearch">
        <uni-icons type="search" size="20" color="#999"></uni-icons>
        <text class="search-placeholder">搜索用户、动态...</text>
      </view>
    </view>

    <!-- 动态列表 -->
    <scroll-view 
      class="content" 
      scroll-y="true" 
      @scrolltolower="loadMore"
      refresher-enabled="true"
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <view class="post-list">
        <view 
          class="post-item card" 
          v-for="post in postList" 
          :key="post.id"
          @click="goToDetail(post.id)"
        >
          <!-- 用户信息 -->
          <view class="user-info flex align-center">
            <image 
              class="avatar avatar-medium" 
              :src="post.user.avatar" 
              mode="aspectFill"
              @click.stop="goToUserProfile(post.user.id)"
            ></image>
            <view class="user-details ml-20">
              <text class="username">{{ post.user.nickname }}</text>
              <text class="post-time text-muted text-small">{{ formatTime(post.createTime) }}</text>
            </view>
            <view class="follow-btn" v-if="!post.user.isFollowed && post.user.id !== currentUserId">
              <button 
                class="btn-follow" 
                size="mini" 
                @click.stop="followUser(post.user.id)"
              >
                关注
              </button>
            </view>
          </view>

          <!-- 动态内容 -->
          <view class="post-content mt-20">
            <text class="content-text">{{ post.content }}</text>
            
            <!-- 图片 -->
            <view class="image-grid mt-20" v-if="post.images && post.images.length > 0">
              <view 
                class="image-item" 
                v-for="(image, index) in post.images" 
                :key="index"
                @click.stop="previewImage(post.images, index)"
              >
                <image :src="image" mode="aspectFill"></image>
              </view>
            </view>
          </view>

          <!-- 互动区域 -->
          <view class="interaction-bar flex justify-between align-center mt-30">
            <view class="interaction-item flex align-center" @click.stop="toggleLike(post)">
              <uni-icons 
                :type="post.isLiked ? 'heart-filled' : 'heart'" 
                :color="post.isLiked ? '#FF3B30' : '#999'" 
                size="20"
              ></uni-icons>
              <text class="interaction-text ml-10">{{ post.likeCount || 0 }}</text>
            </view>
            
            <view class="interaction-item flex align-center" @click.stop="goToDetail(post.id)">
              <uni-icons type="chat" color="#999" size="20"></uni-icons>
              <text class="interaction-text ml-10">{{ post.commentCount || 0 }}</text>
            </view>
            
            <view class="interaction-item flex align-center" @click.stop="sharePost(post)">
              <uni-icons type="redo" color="#999" size="20"></uni-icons>
              <text class="interaction-text ml-10">分享</text>
            </view>
          </view>
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
  name: 'IndexPage',
  data() {
    return {
      postList: [],
      refreshing: false,
      hasMore: true,
      loadStatus: 'more',
      currentPage: 1,
      pageSize: 10,
      currentUserId: null
    }
  },
  onLoad() {
    this.getCurrentUser()
    this.loadPosts()
  },
  onShow() {
    // 每次显示页面时刷新数据
    this.refreshPosts()
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

    // 加载动态列表
    async loadPosts(refresh = false) {
      if (refresh) {
        this.currentPage = 1
        this.hasMore = true
        this.postList = []
      }

      this.loadStatus = 'loading'

      try {
        // 模拟API调用
        const response = await this.mockGetPosts(this.currentPage, this.pageSize)
        
        if (refresh) {
          this.postList = response.data
        } else {
          this.postList = [...this.postList, ...response.data]
        }

        this.hasMore = response.data.length === this.pageSize
        this.currentPage++
        this.loadStatus = this.hasMore ? 'more' : 'noMore'
      } catch (error) {
        console.error('加载动态失败:', error)
        this.loadStatus = 'more'
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    // 刷新动态
    async onRefresh() {
      this.refreshing = true
      await this.loadPosts(true)
      this.refreshing = false
      uni.stopPullDownRefresh()
    },

    // 加载更多
    loadMore() {
      if (this.hasMore && this.loadStatus !== 'loading') {
        this.loadPosts()
      }
    },

    // 刷新动态（用于onShow）
    refreshPosts() {
      this.loadPosts(true)
    },

    // 点赞/取消点赞
    async toggleLike(post) {
      try {
        // 模拟API调用
        const isLiked = !post.isLiked
        await this.mockToggleLike(post.id, isLiked)
        
        post.isLiked = isLiked
        post.likeCount = isLiked ? (post.likeCount || 0) + 1 : (post.likeCount || 1) - 1
        
        uni.showToast({
          title: isLiked ? '已点赞' : '已取消点赞',
          icon: 'none',
          duration: 1000
        })
      } catch (error) {
        console.error('点赞操作失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    // 关注用户
    async followUser(userId) {
      try {
        await this.mockFollowUser(userId)
        
        // 更新列表中的关注状态
        this.postList.forEach(post => {
          if (post.user.id === userId) {
            post.user.isFollowed = true
          }
        })
        
        uni.showToast({
          title: '关注成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('关注失败:', error)
        uni.showToast({
          title: '关注失败',
          icon: 'none'
        })
      }
    },

    // 分享动态
    sharePost(post) {
      uni.showActionSheet({
        itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              // 分享给朋友
              this.shareToFriend(post)
              break
            case 1:
              // 分享到朋友圈
              this.shareToMoments(post)
              break
            case 2:
              // 复制链接
              this.copyLink(post)
              break
          }
        }
      })
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

    // 跳转到动态详情
    goToDetail(postId) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${postId}`
      })
    },

    // 跳转到用户资料页
    goToUserProfile(userId) {
      uni.navigateTo({
        url: `/pages/userProfile/userProfile?userId=${userId}`
      })
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

    // 模拟API - 获取动态列表
    mockGetPosts(page, size) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData = []
          for (let i = 0; i < size; i++) {
            const id = (page - 1) * size + i + 1
            mockData.push({
              id: id,
              content: `这是第${id}条动态内容，分享生活中的美好时刻！`,
              images: Math.random() > 0.5 ? [
                'https://picsum.photos/300/300?random=' + id,
                'https://picsum.photos/300/300?random=' + (id + 100)
              ] : [],
              createTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
              likeCount: Math.floor(Math.random() * 100),
              commentCount: Math.floor(Math.random() * 50),
              isLiked: Math.random() > 0.7,
              user: {
                id: Math.floor(Math.random() * 100) + 1,
                nickname: `用户${id}`,
                avatar: `https://picsum.photos/100/100?random=${id + 200}`,
                isFollowed: Math.random() > 0.8
              }
            })
          }
          resolve({ data: mockData })
        }, 1000)
      })
    },

    // 模拟API - 点赞操作
    mockToggleLike(postId, isLiked) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 300)
      })
    },

    // 模拟API - 关注用户
    mockFollowUser(userId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 500)
      })
    },

    // 分享给朋友
    shareToFriend(post) {
      // 实际项目中调用微信分享API
      uni.showToast({
        title: '分享成功',
        icon: 'success'
      })
    },

    // 分享到朋友圈
    shareToMoments(post) {
      // 实际项目中调用微信分享API
      uni.showToast({
        title: '分享成功',
        icon: 'success'
      })
    },

    // 复制链接
    copyLink(post) {
      uni.setClipboardData({
        data: `https://your-domain.com/post/${post.id}`,
        success: () => {
          uni.showToast({
            title: '链接已复制',
            icon: 'success'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.index-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.search-bar {
  background-color: white;
  padding: 20rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.search-input {
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

.post-item {
  margin-bottom: 20rpx;
}

.user-info {
  position: relative;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  display: block;
}

.post-time {
  display: block;
  margin-top: 4rpx;
}

.btn-follow {
  background-color: #007AFF;
  color: white;
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  border: none;
}

.content-text {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
}

.image-item {
  aspect-ratio: 1;
  border-radius: 8rpx;
  overflow: hidden;
}

.image-item image {
  width: 100%;
  height: 100%;
}

.interaction-bar {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.interaction-item {
  flex: 1;
  justify-content: center;
}

.interaction-text {
  font-size: 26rpx;
  color: #666;
}

.load-more {
  padding: 20rpx;
}
</style>
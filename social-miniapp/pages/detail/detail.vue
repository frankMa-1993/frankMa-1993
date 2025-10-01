<template>
  <view class="detail-page">
    <scroll-view 
      class="content" 
      scroll-y="true"
      refresher-enabled="true"
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <!-- 动态内容 -->
      <view class="post-detail" v-if="postDetail">
        <!-- 用户信息 -->
        <view class="user-section">
          <view class="user-info" @click="goToUserProfile(postDetail.user.id)">
            <image class="user-avatar" :src="postDetail.user.avatar" mode="aspectFill"></image>
            <view class="user-details">
              <text class="username">{{ postDetail.user.nickname }}</text>
              <text class="post-time">{{ formatTime(postDetail.createTime) }}</text>
              <text class="location" v-if="postDetail.location">
                <uni-icons type="location" size="12" color="#999"></uni-icons>
                {{ postDetail.location }}
              </text>
            </view>
          </view>
          
          <button 
            class="follow-btn"
            v-if="!postDetail.user.isFollowed && postDetail.user.id !== currentUserId"
            @click="followUser"
          >
            {{ postDetail.user.isFollowed ? '已关注' : '关注' }}
          </button>
        </view>

        <!-- 动态内容 -->
        <view class="post-content">
          <text class="content-text">{{ postDetail.content }}</text>
          
          <!-- 话题标签 -->
          <view class="topics" v-if="postDetail.topics && postDetail.topics.length > 0">
            <text 
              class="topic-tag"
              v-for="topic in postDetail.topics"
              :key="topic"
              @click="goToTopic(topic)"
            >
              #{{ topic }}
            </text>
          </view>
        </view>

        <!-- 图片展示 -->
        <view class="images-section" v-if="postDetail.images && postDetail.images.length > 0">
          <view class="images-grid" :class="getGridClass(postDetail.images.length)">
            <view 
              class="image-item"
              v-for="(image, index) in postDetail.images"
              :key="index"
              @click="previewImage(postDetail.images, index)"
            >
              <image :src="image" mode="aspectFill"></image>
            </view>
          </view>
        </view>

        <!-- 互动统计 -->
        <view class="stats-section">
          <text class="stats-text">{{ postDetail.likeCount || 0 }}人点赞 · {{ postDetail.commentCount || 0 }}条评论</text>
        </view>

        <!-- 互动按钮 -->
        <view class="action-bar">
          <view class="action-item" @click="toggleLike">
            <uni-icons 
              :type="postDetail.isLiked ? 'heart-filled' : 'heart'" 
              :color="postDetail.isLiked ? '#FF3B30' : '#666'" 
              size="24"
            ></uni-icons>
            <text class="action-text" :class="{ liked: postDetail.isLiked }">点赞</text>
          </view>
          
          <view class="action-item" @click="focusCommentInput">
            <uni-icons type="chat" color="#666" size="24"></uni-icons>
            <text class="action-text">评论</text>
          </view>
          
          <view class="action-item" @click="sharePost">
            <uni-icons type="redo" color="#666" size="24"></uni-icons>
            <text class="action-text">分享</text>
          </view>
          
          <view class="action-item" @click="toggleFavorite">
            <uni-icons 
              :type="postDetail.isFavorited ? 'star-filled' : 'star'" 
              :color="postDetail.isFavorited ? '#FFD700' : '#666'" 
              size="24"
            ></uni-icons>
            <text class="action-text" :class="{ favorited: postDetail.isFavorited }">收藏</text>
          </view>
        </view>
      </view>

      <!-- 评论列表 -->
      <view class="comments-section">
        <view class="comments-header">
          <text class="comments-title">评论 ({{ comments.length }})</text>
          <view class="sort-options">
            <text 
              class="sort-option"
              :class="{ active: sortType === 'time' }"
              @click="changeSortType('time')"
            >
              最新
            </text>
            <text 
              class="sort-option"
              :class="{ active: sortType === 'hot' }"
              @click="changeSortType('hot')"
            >
              最热
            </text>
          </view>
        </view>

        <view class="comments-list">
          <view 
            class="comment-item"
            v-for="comment in comments"
            :key="comment.id"
          >
            <image 
              class="comment-avatar" 
              :src="comment.user.avatar" 
              mode="aspectFill"
              @click="goToUserProfile(comment.user.id)"
            ></image>
            
            <view class="comment-content">
              <view class="comment-header">
                <text class="comment-username">{{ comment.user.nickname }}</text>
                <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
              </view>
              
              <text class="comment-text">{{ comment.content }}</text>
              
              <!-- 回复某人 -->
              <view class="reply-to" v-if="comment.replyTo">
                <text class="reply-text">回复 @{{ comment.replyTo.nickname }}: {{ comment.replyTo.content }}</text>
              </view>
              
              <!-- 评论图片 -->
              <view class="comment-images" v-if="comment.images && comment.images.length > 0">
                <image 
                  class="comment-image"
                  v-for="(image, index) in comment.images"
                  :key="index"
                  :src="image"
                  mode="aspectFill"
                  @click="previewImage(comment.images, index)"
                ></image>
              </view>
              
              <!-- 评论互动 -->
              <view class="comment-actions">
                <view class="comment-action" @click="toggleCommentLike(comment)">
                  <uni-icons 
                    :type="comment.isLiked ? 'heart-filled' : 'heart'" 
                    :color="comment.isLiked ? '#FF3B30' : '#999'" 
                    size="16"
                  ></uni-icons>
                  <text class="action-count">{{ comment.likeCount || 0 }}</text>
                </view>
                
                <view class="comment-action" @click="replyComment(comment)">
                  <uni-icons type="chat" color="#999" size="16"></uni-icons>
                  <text class="action-text">回复</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多评论 -->
        <view class="load-more-comments" v-if="hasMoreComments">
          <button class="load-more-btn" @click="loadMoreComments">加载更多评论</button>
        </view>
      </view>
    </scroll-view>

    <!-- 评论输入框 -->
    <view class="comment-input-section">
      <view class="input-wrapper">
        <input 
          class="comment-input"
          :placeholder="inputPlaceholder"
          v-model="commentText"
          @focus="onInputFocus"
          @blur="onInputBlur"
          ref="commentInput"
        />
        <button 
          class="send-btn"
          :disabled="!commentText.trim()"
          @click="sendComment"
        >
          发送
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DetailPage',
  data() {
    return {
      postId: null,
      postDetail: null,
      comments: [],
      refreshing: false,
      currentUserId: null,
      sortType: 'time', // time, hot
      hasMoreComments: true,
      commentPage: 1,
      
      // 评论相关
      commentText: '',
      inputPlaceholder: '写评论...',
      replyToComment: null,
      isInputFocused: false
    }
  },
  onLoad(options) {
    this.postId = options.id
    this.getCurrentUser()
    this.loadPostDetail()
    this.loadComments()
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    // 获取当前用户信息
    getCurrentUser() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.currentUserId = userInfo.id
      }
    },

    // 加载动态详情
    async loadPostDetail() {
      try {
        this.postDetail = await this.mockGetPostDetail(this.postId)
      } catch (error) {
        console.error('加载动态详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    // 加载评论列表
    async loadComments(refresh = false) {
      try {
        if (refresh) {
          this.commentPage = 1
          this.hasMoreComments = true
        }

        const newComments = await this.mockGetComments(this.postId, this.commentPage, this.sortType)
        
        if (refresh) {
          this.comments = newComments
        } else {
          this.comments = [...this.comments, ...newComments]
        }

        this.hasMoreComments = newComments.length === 10 // 假设每页10条
        this.commentPage++
      } catch (error) {
        console.error('加载评论失败:', error)
      }
    },

    // 刷新数据
    async onRefresh() {
      this.refreshing = true
      await Promise.all([
        this.loadPostDetail(),
        this.loadComments(true)
      ])
      this.refreshing = false
      uni.stopPullDownRefresh()
    },

    // 切换排序方式
    changeSortType(type) {
      if (this.sortType !== type) {
        this.sortType = type
        this.loadComments(true)
      }
    },

    // 加载更多评论
    loadMoreComments() {
      if (this.hasMoreComments) {
        this.loadComments()
      }
    },

    // 点赞/取消点赞
    async toggleLike() {
      try {
        const isLiked = !this.postDetail.isLiked
        await this.mockToggleLike(this.postId, isLiked)
        
        this.postDetail.isLiked = isLiked
        this.postDetail.likeCount = isLiked ? 
          (this.postDetail.likeCount || 0) + 1 : 
          (this.postDetail.likeCount || 1) - 1
        
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

    // 收藏/取消收藏
    async toggleFavorite() {
      try {
        const isFavorited = !this.postDetail.isFavorited
        await this.mockToggleFavorite(this.postId, isFavorited)
        
        this.postDetail.isFavorited = isFavorited
        
        uni.showToast({
          title: isFavorited ? '已收藏' : '已取消收藏',
          icon: 'success',
          duration: 1000
        })
      } catch (error) {
        console.error('收藏操作失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    // 关注用户
    async followUser() {
      try {
        await this.mockFollowUser(this.postDetail.user.id)
        this.postDetail.user.isFollowed = true
        
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

    // 评论点赞
    async toggleCommentLike(comment) {
      try {
        const isLiked = !comment.isLiked
        await this.mockToggleCommentLike(comment.id, isLiked)
        
        comment.isLiked = isLiked
        comment.likeCount = isLiked ? 
          (comment.likeCount || 0) + 1 : 
          (comment.likeCount || 1) - 1
      } catch (error) {
        console.error('评论点赞失败:', error)
      }
    },

    // 回复评论
    replyComment(comment) {
      this.replyToComment = comment
      this.inputPlaceholder = `回复 @${comment.user.nickname}`
      this.focusCommentInput()
    },

    // 聚焦评论输入框
    focusCommentInput() {
      // 在小程序中需要使用 createSelectorQuery 来聚焦
      this.$nextTick(() => {
        uni.createSelectorQuery().select('.comment-input').fields({
          node: true
        }).exec((res) => {
          if (res[0] && res[0].node) {
            res[0].node.focus()
          }
        })
      })
    },

    // 输入框聚焦
    onInputFocus() {
      this.isInputFocused = true
    },

    // 输入框失焦
    onInputBlur() {
      this.isInputFocused = false
      if (!this.commentText.trim()) {
        this.replyToComment = null
        this.inputPlaceholder = '写评论...'
      }
    },

    // 发送评论
    async sendComment() {
      if (!this.commentText.trim()) return

      try {
        const commentData = {
          content: this.commentText.trim(),
          replyToId: this.replyToComment ? this.replyToComment.id : null
        }

        const newComment = await this.mockSendComment(this.postId, commentData)
        
        // 添加到评论列表顶部
        this.comments.unshift(newComment)
        
        // 更新评论数量
        this.postDetail.commentCount = (this.postDetail.commentCount || 0) + 1
        
        // 清空输入框
        this.commentText = ''
        this.replyToComment = null
        this.inputPlaceholder = '写评论...'
        
        uni.showToast({
          title: '评论成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('发送评论失败:', error)
        uni.showToast({
          title: '评论失败',
          icon: 'none'
        })
      }
    },

    // 分享动态
    sharePost() {
      uni.showActionSheet({
        itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              // 分享给朋友
              uni.showToast({
                title: '分享成功',
                icon: 'success'
              })
              break
            case 1:
              // 分享到朋友圈
              uni.showToast({
                title: '分享成功',
                icon: 'success'
              })
              break
            case 2:
              // 复制链接
              uni.setClipboardData({
                data: `https://your-domain.com/post/${this.postId}`,
                success: () => {
                  uni.showToast({
                    title: '链接已复制',
                    icon: 'success'
                  })
                }
              })
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

    // 跳转到用户资料页
    goToUserProfile(userId) {
      uni.navigateTo({
        url: `/pages/userProfile/userProfile?userId=${userId}`
      })
    },

    // 跳转到话题页面
    goToTopic(topic) {
      uni.navigateTo({
        url: `/pages/topic/topic?name=${topic}`
      })
    },

    // 获取图片网格样式类
    getGridClass(count) {
      if (count === 1) return 'grid-1'
      if (count === 2) return 'grid-2'
      if (count === 4) return 'grid-4'
      return 'grid-3'
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

    // 模拟API - 获取动态详情
    mockGetPostDetail(postId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: postId,
            content: '这是一条详细的动态内容，包含了丰富的信息和美丽的图片。今天天气很好，心情也很棒！',
            images: [
              'https://picsum.photos/400/300?random=1',
              'https://picsum.photos/400/300?random=2',
              'https://picsum.photos/400/300?random=3'
            ],
            topics: ['日常生活', '美好时光'],
            location: '北京市朝阳区',
            createTime: Date.now() - 2 * 60 * 60 * 1000,
            likeCount: 128,
            commentCount: 45,
            isLiked: false,
            isFavorited: false,
            user: {
              id: 1,
              nickname: '动态作者',
              avatar: 'https://picsum.photos/100/100?random=10',
              isFollowed: false
            }
          })
        }, 500)
      })
    },

    // 模拟API - 获取评论列表
    mockGetComments(postId, page, sortType) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const comments = []
          for (let i = 1; i <= 10; i++) {
            const commentId = (page - 1) * 10 + i
            comments.push({
              id: commentId,
              content: `这是第${commentId}条评论，内容很精彩！`,
              createTime: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
              likeCount: Math.floor(Math.random() * 20),
              isLiked: Math.random() > 0.8,
              user: {
                id: commentId,
                nickname: `评论用户${commentId}`,
                avatar: `https://picsum.photos/100/100?random=${commentId + 100}`
              },
              replyTo: Math.random() > 0.7 ? {
                nickname: '其他用户',
                content: '之前的评论内容'
              } : null,
              images: Math.random() > 0.9 ? [
                `https://picsum.photos/200/150?random=${commentId + 200}`
              ] : []
            })
          }
          resolve(comments)
        }, 500)
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

    // 模拟API - 收藏操作
    mockToggleFavorite(postId, isFavorited) {
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

    // 模拟API - 评论点赞
    mockToggleCommentLike(commentId, isLiked) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 200)
      })
    },

    // 模拟API - 发送评论
    mockSendComment(postId, commentData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const currentUser = uni.getStorageSync('userInfo')
          resolve({
            id: Date.now(),
            content: commentData.content,
            createTime: Date.now(),
            likeCount: 0,
            isLiked: false,
            user: {
              id: currentUser.id,
              nickname: currentUser.nickname,
              avatar: currentUser.avatar
            },
            replyTo: commentData.replyToId ? {
              nickname: '被回复用户',
              content: '被回复的内容'
            } : null
          })
        }, 500)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.content {
  flex: 1;
}

.post-detail {
  background-color: white;
  margin-bottom: 20rpx;
}

.user-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 4rpx;
}

.location {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
}

.follow-btn {
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
}

.post-content {
  padding: 30rpx;
}

.content-text {
  font-size: 32rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 20rpx;
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.topic-tag {
  color: #007AFF;
  font-size: 28rpx;
  padding: 8rpx 16rpx;
  background-color: #f0f8ff;
  border-radius: 16rpx;
}

.images-section {
  padding: 0 30rpx 30rpx;
}

.images-grid {
  display: grid;
  gap: 10rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.grid-1 {
  grid-template-columns: 1fr;
  max-width: 500rpx;
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(2, 1fr);
}

.image-item {
  aspect-ratio: 1;
  overflow: hidden;
}

.image-item image {
  width: 100%;
  height: 100%;
}

.stats-section {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
}

.stats-text {
  font-size: 26rpx;
  color: #666;
}

.action-bar {
  display: flex;
  padding: 20rpx 30rpx;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.action-text {
  font-size: 24rpx;
  color: #666;
}

.action-text.liked {
  color: #FF3B30;
}

.action-text.favorited {
  color: #FFD700;
}

.comments-section {
  background-color: white;
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.comments-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.sort-options {
  display: flex;
  gap: 30rpx;
}

.sort-option {
  font-size: 26rpx;
  color: #999;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.sort-option.active {
  color: #007AFF;
  background-color: #f0f8ff;
}

.comments-list {
  padding: 0 30rpx;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.comment-username {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
}

.comment-text {
  font-size: 28rpx;
  line-height: 1.5;
  color: #333;
  margin-bottom: 12rpx;
}

.reply-to {
  background-color: #f8f8f8;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.reply-text {
  font-size: 26rpx;
  color: #666;
}

.comment-images {
  display: flex;
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.comment-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
}

.comment-actions {
  display: flex;
  gap: 40rpx;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.action-count,
.action-text {
  font-size: 22rpx;
  color: #999;
}

.load-more-comments {
  padding: 30rpx;
  text-align: center;
}

.load-more-btn {
  background-color: #f8f8f8;
  color: #666;
  border: none;
  border-radius: 20rpx;
  padding: 16rpx 40rpx;
  font-size: 26rpx;
}

.comment-input-section {
  background-color: white;
  border-top: 1rpx solid #e5e5e5;
  padding: 20rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.comment-input {
  flex: 1;
  height: 70rpx;
  background-color: #f8f8f8;
  border-radius: 35rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.send-btn {
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 16rpx 32rpx;
  font-size: 26rpx;
}

.send-btn:disabled {
  background-color: #ccc;
}
</style>
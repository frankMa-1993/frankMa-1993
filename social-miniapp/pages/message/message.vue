<template>
  <view class="message-page">
    <!-- 消息类型切换 -->
    <view class="message-tabs">
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'chat' }"
        @click="switchTab('chat')"
      >
        <text class="tab-text">聊天</text>
        <view class="tab-badge" v-if="chatUnreadCount > 0">{{ chatUnreadCount }}</view>
      </view>
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'notification' }"
        @click="switchTab('notification')"
      >
        <text class="tab-text">通知</text>
        <view class="tab-badge" v-if="notificationUnreadCount > 0">{{ notificationUnreadCount }}</view>
      </view>
    </view>

    <!-- 聊天列表 -->
    <scroll-view 
      class="content" 
      scroll-y="true" 
      v-if="activeTab === 'chat'"
      refresher-enabled="true"
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <view class="chat-list">
        <view 
          class="chat-item"
          v-for="chat in chatList"
          :key="chat.id"
          @click="openChat(chat)"
        >
          <view class="chat-avatar-wrapper">
            <image class="chat-avatar" :src="chat.avatar" mode="aspectFill"></image>
            <view class="online-status" v-if="chat.isOnline"></view>
          </view>
          
          <view class="chat-content">
            <view class="chat-header">
              <text class="chat-name">{{ chat.name }}</text>
              <text class="chat-time">{{ formatTime(chat.lastMessageTime) }}</text>
            </view>
            <view class="chat-message">
              <text class="message-text" :class="{ unread: chat.unreadCount > 0 }">
                {{ formatLastMessage(chat.lastMessage) }}
              </text>
              <view class="unread-badge" v-if="chat.unreadCount > 0">
                {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 通知列表 -->
    <scroll-view 
      class="content" 
      scroll-y="true" 
      v-if="activeTab === 'notification'"
      refresher-enabled="true"
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <view class="notification-list">
        <view 
          class="notification-item"
          v-for="notification in notificationList"
          :key="notification.id"
          @click="handleNotification(notification)"
        >
          <image class="notification-avatar" :src="notification.avatar" mode="aspectFill"></image>
          
          <view class="notification-content">
            <view class="notification-header">
              <text class="notification-title">{{ notification.title }}</text>
              <text class="notification-time">{{ formatTime(notification.createTime) }}</text>
            </view>
            <text class="notification-desc">{{ notification.content }}</text>
            
            <!-- 相关内容预览 -->
            <view class="notification-preview" v-if="notification.preview">
              <image 
                class="preview-image" 
                :src="notification.preview.image" 
                mode="aspectFill"
                v-if="notification.preview.image"
              ></image>
              <text class="preview-text">{{ notification.preview.text }}</text>
            </view>
          </view>
          
          <view class="unread-dot" v-if="!notification.isRead"></view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="isEmpty">
      <uni-icons type="chatboxes" size="60" color="#ccc"></uni-icons>
      <text class="empty-text">{{ activeTab === 'chat' ? '暂无聊天记录' : '暂无通知消息' }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MessagePage',
  data() {
    return {
      activeTab: 'chat', // chat, notification
      refreshing: false,
      chatList: [],
      notificationList: [],
      chatUnreadCount: 0,
      notificationUnreadCount: 0
    }
  },
  computed: {
    isEmpty() {
      if (this.activeTab === 'chat') {
        return this.chatList.length === 0
      } else {
        return this.notificationList.length === 0
      }
    }
  },
  onLoad() {
    this.loadMessages()
  },
  onShow() {
    // 每次显示时刷新数据
    this.loadMessages()
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    // 切换标签
    switchTab(tab) {
      this.activeTab = tab
      if (tab === 'chat' && this.chatList.length === 0) {
        this.loadChatList()
      } else if (tab === 'notification' && this.notificationList.length === 0) {
        this.loadNotificationList()
      }
    },

    // 加载消息数据
    async loadMessages() {
      try {
        await Promise.all([
          this.loadChatList(),
          this.loadNotificationList()
        ])
        this.updateUnreadCounts()
      } catch (error) {
        console.error('加载消息失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    // 刷新数据
    async onRefresh() {
      this.refreshing = true
      await this.loadMessages()
      this.refreshing = false
      uni.stopPullDownRefresh()
    },

    // 加载聊天列表
    async loadChatList() {
      try {
        this.chatList = await this.mockGetChatList()
      } catch (error) {
        console.error('加载聊天列表失败:', error)
      }
    },

    // 加载通知列表
    async loadNotificationList() {
      try {
        this.notificationList = await this.mockGetNotificationList()
      } catch (error) {
        console.error('加载通知列表失败:', error)
      }
    },

    // 更新未读数量
    updateUnreadCounts() {
      this.chatUnreadCount = this.chatList.reduce((total, chat) => total + (chat.unreadCount || 0), 0)
      this.notificationUnreadCount = this.notificationList.filter(item => !item.isRead).length
    },

    // 打开聊天
    openChat(chat) {
      uni.navigateTo({
        url: `/pages/chat/chat?userId=${chat.userId}&name=${chat.name}&avatar=${chat.avatar}`
      })
    },

    // 处理通知点击
    handleNotification(notification) {
      // 标记为已读
      notification.isRead = true
      this.updateUnreadCounts()
      
      // 根据通知类型跳转
      switch (notification.type) {
        case 'like':
        case 'comment':
          // 跳转到动态详情
          uni.navigateTo({
            url: `/pages/detail/detail?id=${notification.targetId}`
          })
          break
        case 'follow':
          // 跳转到用户资料页
          uni.navigateTo({
            url: `/pages/userProfile/userProfile?userId=${notification.fromUserId}`
          })
          break
        case 'mention':
          // 跳转到相关动态
          uni.navigateTo({
            url: `/pages/detail/detail?id=${notification.targetId}`
          })
          break
        default:
          break
      }
    },

    // 格式化最后一条消息
    formatLastMessage(message) {
      if (!message) return ''
      
      switch (message.type) {
        case 'text':
          return message.content
        case 'image':
          return '[图片]'
        case 'voice':
          return '[语音]'
        case 'video':
          return '[视频]'
        default:
          return '[消息]'
      }
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
      } else if (diff < 7 * day) {
        return `${Math.floor(diff / day)}天前`
      } else {
        const date = new Date(timestamp)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }
    },

    // 模拟API - 获取聊天列表
    mockGetChatList() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const chatList = []
          for (let i = 1; i <= 8; i++) {
            chatList.push({
              id: i,
              userId: i,
              name: `好友${i}`,
              avatar: `https://picsum.photos/100/100?random=${i}`,
              isOnline: Math.random() > 0.6,
              lastMessage: {
                type: 'text',
                content: `这是来自好友${i}的最后一条消息`
              },
              lastMessageTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
              unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0
            })
          }
          resolve(chatList)
        }, 500)
      })
    },

    // 模拟API - 获取通知列表
    mockGetNotificationList() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const notifications = [
            {
              id: 1,
              type: 'like',
              title: '用户A点赞了你的动态',
              content: '用户A觉得你的动态很棒',
              avatar: 'https://picsum.photos/100/100?random=101',
              createTime: Date.now() - 30 * 60 * 1000,
              isRead: false,
              fromUserId: 101,
              targetId: 1,
              preview: {
                text: '分享今天的美好时光',
                image: 'https://picsum.photos/100/100?random=201'
              }
            },
            {
              id: 2,
              type: 'comment',
              title: '用户B评论了你的动态',
              content: '用户B: 太棒了！',
              avatar: 'https://picsum.photos/100/100?random=102',
              createTime: Date.now() - 2 * 60 * 60 * 1000,
              isRead: false,
              fromUserId: 102,
              targetId: 2,
              preview: {
                text: '今天的天气真不错',
                image: 'https://picsum.photos/100/100?random=202'
              }
            },
            {
              id: 3,
              type: 'follow',
              title: '用户C关注了你',
              content: '用户C开始关注你了',
              avatar: 'https://picsum.photos/100/100?random=103',
              createTime: Date.now() - 4 * 60 * 60 * 1000,
              isRead: true,
              fromUserId: 103
            },
            {
              id: 4,
              type: 'mention',
              title: '用户D在动态中提到了你',
              content: '用户D在动态中@了你',
              avatar: 'https://picsum.photos/100/100?random=104',
              createTime: Date.now() - 6 * 60 * 60 * 1000,
              isRead: true,
              fromUserId: 104,
              targetId: 3,
              preview: {
                text: '和@你 一起度过愉快的时光'
              }
            }
          ]
          resolve(notifications)
        }, 500)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.message-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.message-tabs {
  display: flex;
  background-color: white;
  border-bottom: 1rpx solid #e5e5e5;
}

.tab-item {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tab-item.active {
  color: #007AFF;
  border-bottom: 4rpx solid #007AFF;
}

.tab-text {
  font-size: 30rpx;
  font-weight: 500;
}

.tab-badge {
  position: absolute;
  top: 16rpx;
  right: 50rpx;
  background-color: #FF3B30;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
}

.content {
  flex: 1;
}

.chat-list {
  background-color: white;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.chat-item:last-child {
  border-bottom: none;
}

.chat-avatar-wrapper {
  position: relative;
  margin-right: 24rpx;
}

.chat-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.online-status {
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
  width: 20rpx;
  height: 20rpx;
  background-color: #34C759;
  border: 3rpx solid white;
  border-radius: 50%;
}

.chat-content {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.chat-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.chat-time {
  font-size: 24rpx;
  color: #999;
}

.chat-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-text {
  font-size: 28rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.message-text.unread {
  color: #333;
  font-weight: 500;
}

.unread-badge {
  background-color: #FF3B30;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
  margin-left: 16rpx;
}

.notification-list {
  background-color: white;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.notification-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.notification-time {
  font-size: 24rpx;
  color: #999;
}

.notification-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.4;
  margin-bottom: 16rpx;
}

.notification-preview {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  padding: 16rpx;
}

.preview-image {
  width: 60rpx;
  height: 60rpx;
  border-radius: 6rpx;
  margin-right: 16rpx;
}

.preview-text {
  font-size: 26rpx;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-dot {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: #FF3B30;
  border-radius: 50%;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 30rpx;
}
</style>
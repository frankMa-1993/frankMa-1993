<template>
  <view class="publish-page">
    <!-- 发布内容区域 -->
    <scroll-view class="content" scroll-y="true">
      <!-- 文本输入 -->
      <view class="text-input-section">
        <textarea
          class="content-input"
          placeholder="分享你的生活..."
          v-model="content"
          :maxlength="500"
          auto-height
          show-confirm-bar="false"
        ></textarea>
        <view class="char-count">{{ content.length }}/500</view>
      </view>

      <!-- 图片选择区域 -->
      <view class="image-section">
        <view class="image-grid">
          <view 
            class="image-item" 
            v-for="(image, index) in selectedImages" 
            :key="index"
          >
            <image :src="image" mode="aspectFill"></image>
            <view class="delete-btn" @click="removeImage(index)">
              <uni-icons type="clear" size="16" color="white"></uni-icons>
            </view>
          </view>
          
          <!-- 添加图片按钮 -->
          <view 
            class="add-image-btn" 
            v-if="selectedImages.length < 9"
            @click="chooseImage"
          >
            <uni-icons type="camera" size="30" color="#999"></uni-icons>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>

      <!-- 功能选项 -->
      <view class="options-section">
        <!-- 位置 -->
        <view class="option-item" @click="chooseLocation">
          <uni-icons type="location" size="20" color="#007AFF"></uni-icons>
          <text class="option-text">{{ location || '添加位置' }}</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>

        <!-- 话题 -->
        <view class="option-item" @click="addTopic">
          <uni-icons type="chatboxes" size="20" color="#007AFF"></uni-icons>
          <text class="option-text">添加话题</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>

        <!-- 提醒谁看 -->
        <view class="option-item" @click="mentionFriends">
          <uni-icons type="person" size="20" color="#007AFF"></uni-icons>
          <text class="option-text">提醒谁看</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </view>

      <!-- 话题标签显示 -->
      <view class="topics-display" v-if="selectedTopics.length > 0">
        <view 
          class="topic-tag" 
          v-for="(topic, index) in selectedTopics" 
          :key="index"
        >
          <text class="topic-text">#{{ topic }}</text>
          <view class="topic-delete" @click="removeTopic(index)">
            <uni-icons type="clear" size="12" color="#007AFF"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 提及的朋友显示 -->
      <view class="mentions-display" v-if="mentionedFriends.length > 0">
        <text class="mentions-label">提醒：</text>
        <text 
          class="mention-name" 
          v-for="(friend, index) in mentionedFriends" 
          :key="index"
        >
          @{{ friend.nickname }}
        </text>
      </view>
    </scroll-view>

    <!-- 底部发布栏 -->
    <view class="publish-bar">
      <view class="publish-options">
        <view class="visibility-option" @click="showVisibilityOptions">
          <uni-icons :type="visibilityIcon" size="20" :color="visibilityColor"></uni-icons>
          <text class="visibility-text">{{ visibilityText }}</text>
        </view>
      </view>
      
      <button 
        class="publish-btn"
        :disabled="!canPublish"
        @click="publishPost"
      >
        {{ publishing ? '发布中...' : '发布' }}
      </button>
    </view>

    <!-- 话题选择弹窗 -->
    <uni-popup ref="topicPopup" type="bottom">
      <view class="topic-popup">
        <view class="popup-header">
          <text class="popup-title">选择话题</text>
          <view class="popup-close" @click="closeTopicPopup">
            <uni-icons type="clear" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <view class="topic-search">
          <input 
            class="search-input"
            placeholder="搜索或创建话题"
            v-model="topicKeyword"
            @input="searchTopics"
          />
        </view>
        
        <scroll-view class="topic-list" scroll-y="true">
          <view 
            class="topic-item"
            v-for="topic in filteredTopics"
            :key="topic.id"
            @click="selectTopic(topic)"
          >
            <text class="topic-name">#{{ topic.name }}</text>
            <text class="topic-count">{{ topic.count }}人参与</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 可见性选择弹窗 -->
    <uni-popup ref="visibilityPopup" type="bottom">
      <view class="visibility-popup">
        <view class="popup-header">
          <text class="popup-title">谁可以看</text>
          <view class="popup-close" @click="closeVisibilityPopup">
            <uni-icons type="clear" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <view class="visibility-options">
          <view 
            class="visibility-item"
            v-for="option in visibilityOptions"
            :key="option.value"
            @click="selectVisibility(option)"
          >
            <uni-icons :type="option.icon" size="24" :color="option.color"></uni-icons>
            <view class="visibility-info">
              <text class="visibility-name">{{ option.name }}</text>
              <text class="visibility-desc">{{ option.desc }}</text>
            </view>
            <uni-icons 
              type="checkmarkempty" 
              size="20" 
              :color="visibility === option.value ? '#007AFF' : 'transparent'"
            ></uni-icons>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'PublishPage',
  data() {
    return {
      content: '',
      selectedImages: [],
      location: '',
      selectedTopics: [],
      mentionedFriends: [],
      visibility: 'public', // public, friends, private
      publishing: false,
      
      // 话题相关
      topicKeyword: '',
      allTopics: [],
      filteredTopics: [],
      
      // 可见性选项
      visibilityOptions: [
        {
          value: 'public',
          name: '公开',
          desc: '所有人都可以看到',
          icon: 'world',
          color: '#007AFF'
        },
        {
          value: 'friends',
          name: '朋友可见',
          desc: '仅关注的朋友可以看到',
          icon: 'person',
          color: '#34C759'
        },
        {
          value: 'private',
          name: '仅自己可见',
          desc: '只有自己可以看到',
          icon: 'locked',
          color: '#FF9500'
        }
      ]
    }
  },
  computed: {
    canPublish() {
      return (this.content.trim().length > 0 || this.selectedImages.length > 0) && !this.publishing
    },
    
    visibilityIcon() {
      const option = this.visibilityOptions.find(item => item.value === this.visibility)
      return option ? option.icon : 'world'
    },
    
    visibilityColor() {
      const option = this.visibilityOptions.find(item => item.value === this.visibility)
      return option ? option.color : '#007AFF'
    },
    
    visibilityText() {
      const option = this.visibilityOptions.find(item => item.value === this.visibility)
      return option ? option.name : '公开'
    }
  },
  onLoad() {
    this.loadTopics()
  },
  onUnload() {
    // 页面卸载时提示保存草稿
    if (this.content.trim() || this.selectedImages.length > 0) {
      this.saveDraft()
    }
  },
  methods: {
    // 选择图片
    chooseImage() {
      const maxCount = 9 - this.selectedImages.length
      
      uni.chooseImage({
        count: maxCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.selectedImages = [...this.selectedImages, ...res.tempFilePaths]
        },
        fail: (error) => {
          console.error('选择图片失败:', error)
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      })
    },

    // 删除图片
    removeImage(index) {
      this.selectedImages.splice(index, 1)
    },

    // 选择位置
    chooseLocation() {
      uni.chooseLocation({
        success: (res) => {
          this.location = res.name || res.address
        },
        fail: (error) => {
          console.error('选择位置失败:', error)
          if (error.errMsg.includes('auth deny')) {
            uni.showModal({
              title: '提示',
              content: '需要位置权限才能选择位置，请在设置中开启',
              showCancel: false
            })
          }
        }
      })
    },

    // 添加话题
    addTopic() {
      this.$refs.topicPopup.open()
    },

    // 搜索话题
    searchTopics() {
      if (this.topicKeyword.trim()) {
        this.filteredTopics = this.allTopics.filter(topic => 
          topic.name.toLowerCase().includes(this.topicKeyword.toLowerCase())
        )
        
        // 如果没有找到匹配的话题，添加创建新话题的选项
        if (this.filteredTopics.length === 0) {
          this.filteredTopics = [{
            id: 'new',
            name: this.topicKeyword,
            count: 0,
            isNew: true
          }]
        }
      } else {
        this.filteredTopics = this.allTopics.slice(0, 20) // 显示热门话题
      }
    },

    // 选择话题
    selectTopic(topic) {
      if (!this.selectedTopics.includes(topic.name)) {
        this.selectedTopics.push(topic.name)
      }
      this.closeTopicPopup()
    },

    // 删除话题
    removeTopic(index) {
      this.selectedTopics.splice(index, 1)
    },

    // 关闭话题弹窗
    closeTopicPopup() {
      this.$refs.topicPopup.close()
      this.topicKeyword = ''
      this.filteredTopics = this.allTopics.slice(0, 20)
    },

    // 提醒朋友
    mentionFriends() {
      uni.navigateTo({
        url: '/pages/selectFriends/selectFriends',
        events: {
          selectFriends: (friends) => {
            this.mentionedFriends = friends
          }
        }
      })
    },

    // 显示可见性选项
    showVisibilityOptions() {
      this.$refs.visibilityPopup.open()
    },

    // 选择可见性
    selectVisibility(option) {
      this.visibility = option.value
      this.closeVisibilityPopup()
    },

    // 关闭可见性弹窗
    closeVisibilityPopup() {
      this.$refs.visibilityPopup.close()
    },

    // 发布动态
    async publishPost() {
      if (!this.canPublish) return

      this.publishing = true

      try {
        // 上传图片
        const imageUrls = await this.uploadImages()
        
        // 构建发布数据
        const postData = {
          content: this.content.trim(),
          images: imageUrls,
          location: this.location,
          topics: this.selectedTopics,
          mentions: this.mentionedFriends.map(friend => friend.id),
          visibility: this.visibility
        }

        // 发布动态
        await this.mockPublishPost(postData)
        
        uni.showToast({
          title: '发布成功',
          icon: 'success'
        })

        // 清空草稿
        this.clearDraft()
        
        // 返回首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
        
      } catch (error) {
        console.error('发布失败:', error)
        uni.showToast({
          title: error.message || '发布失败',
          icon: 'none'
        })
      } finally {
        this.publishing = false
      }
    },

    // 上传图片
    async uploadImages() {
      if (this.selectedImages.length === 0) return []

      const uploadPromises = this.selectedImages.map(imagePath => {
        return this.mockUploadImage(imagePath)
      })

      try {
        const results = await Promise.all(uploadPromises)
        return results
      } catch (error) {
        throw new Error('图片上传失败')
      }
    },

    // 加载话题列表
    async loadTopics() {
      try {
        this.allTopics = await this.mockGetTopics()
        this.filteredTopics = this.allTopics.slice(0, 20)
      } catch (error) {
        console.error('加载话题失败:', error)
      }
    },

    // 保存草稿
    saveDraft() {
      const draft = {
        content: this.content,
        selectedImages: this.selectedImages,
        location: this.location,
        selectedTopics: this.selectedTopics,
        mentionedFriends: this.mentionedFriends,
        visibility: this.visibility,
        timestamp: Date.now()
      }
      
      uni.setStorageSync('publishDraft', draft)
    },

    // 清空草稿
    clearDraft() {
      uni.removeStorageSync('publishDraft')
    },

    // 加载草稿
    loadDraft() {
      const draft = uni.getStorageSync('publishDraft')
      if (draft) {
        this.content = draft.content || ''
        this.selectedImages = draft.selectedImages || []
        this.location = draft.location || ''
        this.selectedTopics = draft.selectedTopics || []
        this.mentionedFriends = draft.mentionedFriends || []
        this.visibility = draft.visibility || 'public'
      }
    },

    // 模拟API - 发布动态
    mockPublishPost(postData) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90%成功率
            resolve({ success: true, postId: Date.now() })
          } else {
            reject(new Error('网络错误，请重试'))
          }
        }, 2000)
      })
    },

    // 模拟API - 上传图片
    mockUploadImage(imagePath) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟返回上传后的URL
          resolve(`https://example.com/images/${Date.now()}_${Math.random()}.jpg`)
        }, 1000)
      })
    },

    // 模拟API - 获取话题列表
    mockGetTopics() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const topics = [
            { id: 1, name: '日常生活', count: 12580 },
            { id: 2, name: '美食分享', count: 8960 },
            { id: 3, name: '旅行记录', count: 7320 },
            { id: 4, name: '摄影', count: 6540 },
            { id: 5, name: '健身打卡', count: 5890 },
            { id: 6, name: '读书笔记', count: 4560 },
            { id: 7, name: '工作日常', count: 3780 },
            { id: 8, name: '宠物', count: 3210 },
            { id: 9, name: '音乐分享', count: 2890 },
            { id: 10, name: '电影推荐', count: 2340 }
          ]
          resolve(topics)
        }, 500)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.publish-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.content {
  flex: 1;
  padding: 20rpx;
}

.text-input-section {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.content-input {
  width: 100%;
  min-height: 200rpx;
  font-size: 32rpx;
  line-height: 1.6;
  color: #333;
}

.char-count {
  position: absolute;
  bottom: 20rpx;
  right: 30rpx;
  font-size: 24rpx;
  color: #999;
}

.image-section {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12rpx;
  overflow: hidden;
}

.image-item image {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-image-btn {
  aspect-ratio: 1;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.add-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.options-section {
  background-color: white;
  border-radius: 16rpx;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.option-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.option-item:last-child {
  border-bottom: none;
}

.option-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  margin-left: 20rpx;
}

.topics-display {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.topic-tag {
  display: flex;
  align-items: center;
  background-color: #f0f8ff;
  border: 1rpx solid #007AFF;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
}

.topic-text {
  font-size: 26rpx;
  color: #007AFF;
}

.topic-delete {
  margin-left: 10rpx;
  width: 30rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mentions-display {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.mentions-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 20rpx;
}

.mention-name {
  font-size: 28rpx;
  color: #007AFF;
  margin-right: 20rpx;
}

.publish-bar {
  background-color: white;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.publish-options {
  display: flex;
  align-items: center;
}

.visibility-option {
  display: flex;
  align-items: center;
}

.visibility-text {
  font-size: 26rpx;
  color: #666;
  margin-left: 10rpx;
}

.publish-btn {
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 16rpx 40rpx;
  font-size: 28rpx;
}

.publish-btn:disabled {
  background-color: #ccc;
}

// 弹窗样式
.topic-popup,
.visibility-popup {
  background-color: white;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.popup-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topic-search {
  padding: 30rpx;
}

.search-input {
  width: 100%;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.topic-list {
  max-height: 400rpx;
  padding: 0 30rpx 30rpx;
}

.topic-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.topic-name {
  font-size: 30rpx;
  color: #333;
}

.topic-count {
  font-size: 24rpx;
  color: #999;
}

.visibility-options {
  padding: 30rpx;
}

.visibility-item {
  display: flex;
  align-items: center;
  height: 120rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.visibility-item:last-child {
  border-bottom: none;
}

.visibility-info {
  flex: 1;
  margin-left: 30rpx;
}

.visibility-name {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.visibility-desc {
  font-size: 24rpx;
  color: #999;
}
</style>
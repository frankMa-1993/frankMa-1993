<template>
  <view id="app">
    <!-- 全局组件容器 -->
  </view>
</template>

<script>
export default {
  name: 'App',
  onLaunch: function() {
    console.log('App Launch')
    
    // 检查登录状态
    this.checkLoginStatus()
    
    // 获取系统信息
    this.getSystemInfo()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (!token || !userInfo) {
        // 未登录，跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    },
    
    // 获取系统信息
    getSystemInfo() {
      uni.getSystemInfo({
        success: (res) => {
          // 存储系统信息
          uni.setStorageSync('systemInfo', res)
          
          // 设置状态栏高度
          const statusBarHeight = res.statusBarHeight || 0
          uni.setStorageSync('statusBarHeight', statusBarHeight)
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 全局样式 */
@import url('./static/css/common.scss');

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 通用样式 */
.container {
  padding: 20rpx;
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.text-center {
  text-align: center;
}

/* 按钮样式 */
.btn-primary {
  background-color: #007AFF;
  color: white;
  border-radius: 8rpx;
  padding: 20rpx 40rpx;
  border: none;
  font-size: 32rpx;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border-radius: 8rpx;
  padding: 20rpx 40rpx;
  border: none;
  font-size: 32rpx;
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 头像样式 */
.avatar {
  border-radius: 50%;
  overflow: hidden;
}

.avatar-small {
  width: 60rpx;
  height: 60rpx;
}

.avatar-medium {
  width: 80rpx;
  height: 80rpx;
}

.avatar-large {
  width: 120rpx;
  height: 120rpx;
}

/* 文本样式 */
.text-primary {
  color: #007AFF;
}

.text-secondary {
  color: #666;
}

.text-muted {
  color: #999;
}

.text-small {
  font-size: 24rpx;
}

.text-normal {
  font-size: 28rpx;
}

.text-large {
  font-size: 32rpx;
}

/* 间距 */
.mt-10 { margin-top: 10rpx; }
.mt-20 { margin-top: 20rpx; }
.mt-30 { margin-top: 30rpx; }
.mb-10 { margin-bottom: 10rpx; }
.mb-20 { margin-bottom: 20rpx; }
.mb-30 { margin-bottom: 30rpx; }
.ml-10 { margin-left: 10rpx; }
.ml-20 { margin-left: 20rpx; }
.mr-10 { margin-right: 10rpx; }
.mr-20 { margin-right: 20rpx; }

.p-10 { padding: 10rpx; }
.p-20 { padding: 20rpx; }
.p-30 { padding: 30rpx; }
</style>
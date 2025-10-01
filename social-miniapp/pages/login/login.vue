<template>
  <view class="login-page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <text class="navbar-title">欢迎使用</text>
      </view>
    </view>

    <!-- 登录内容 -->
    <view class="login-content">
      <!-- Logo和标题 -->
      <view class="header">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
        <text class="app-name">社交小程序</text>
        <text class="app-desc">连接你我，分享生活</text>
      </view>

      <!-- 登录表单 -->
      <view class="login-form">
        <!-- 手机号登录 -->
        <view class="input-group">
          <view class="input-item">
            <uni-icons type="phone" size="20" color="#999"></uni-icons>
            <input 
              class="input-field"
              type="number"
              placeholder="请输入手机号"
              v-model="phoneNumber"
              maxlength="11"
            />
          </view>
          
          <view class="input-item">
            <uni-icons type="locked" size="20" color="#999"></uni-icons>
            <input 
              class="input-field"
              type="number"
              placeholder="请输入验证码"
              v-model="verifyCode"
              maxlength="6"
            />
            <button 
              class="code-btn"
              :disabled="codeDisabled"
              @click="sendCode"
            >
              {{ codeText }}
            </button>
          </view>
        </view>

        <!-- 登录按钮 -->
        <button 
          class="login-btn"
          :disabled="!canLogin"
          @click="loginWithPhone"
        >
          登录
        </button>

        <!-- 分割线 -->
        <view class="divider">
          <text class="divider-text">或</text>
        </view>

        <!-- 微信授权登录 -->
        <button 
          class="wechat-login-btn"
          open-type="getUserInfo"
          @getuserinfo="onGetUserInfo"
        >
          <uni-icons type="weixin" size="20" color="white"></uni-icons>
          <text class="wechat-login-text">微信授权登录</text>
        </button>
      </view>

      <!-- 协议条款 -->
      <view class="agreement">
        <checkbox-group @change="onAgreementChange">
          <checkbox :checked="agreed" color="#007AFF" />
        </checkbox-group>
        <text class="agreement-text">
          我已阅读并同意
          <text class="link" @click="showAgreement('user')">《用户协议》</text>
          和
          <text class="link" @click="showAgreement('privacy')">《隐私政策》</text>
        </text>
      </view>
    </view>

    <!-- 加载遮罩 -->
    <view class="loading-mask" v-if="loading">
      <uni-load-more status="loading"></uni-load-more>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      phoneNumber: '',
      verifyCode: '',
      agreed: false,
      loading: false,
      codeDisabled: false,
      codeText: '获取验证码',
      countdown: 60,
      statusBarHeight: 0
    }
  },
  computed: {
    canLogin() {
      return this.phoneNumber.length === 11 && 
             this.verifyCode.length === 6 && 
             this.agreed
    }
  },
  onLoad() {
    this.getStatusBarHeight()
    this.checkAutoLogin()
  },
  methods: {
    // 获取状态栏高度
    getStatusBarHeight() {
      const systemInfo = uni.getStorageSync('systemInfo')
      this.statusBarHeight = systemInfo?.statusBarHeight || 0
    },

    // 检查自动登录
    checkAutoLogin() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (token && userInfo) {
        // 已登录，跳转到首页
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }
    },

    // 发送验证码
    async sendCode() {
      if (!this.phoneNumber) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }

      if (!/^1[3-9]\d{9}$/.test(this.phoneNumber)) {
        uni.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        })
        return
      }

      try {
        this.codeDisabled = true
        
        // 模拟发送验证码
        await this.mockSendCode(this.phoneNumber)
        
        // 开始倒计时
        this.startCountdown()
        
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
      } catch (error) {
        console.error('发送验证码失败:', error)
        this.codeDisabled = false
        uni.showToast({
          title: '发送失败，请重试',
          icon: 'none'
        })
      }
    },

    // 开始倒计时
    startCountdown() {
      const timer = setInterval(() => {
        this.countdown--
        this.codeText = `${this.countdown}s后重发`
        
        if (this.countdown <= 0) {
          clearInterval(timer)
          this.codeDisabled = false
          this.codeText = '获取验证码'
          this.countdown = 60
        }
      }, 1000)
    },

    // 手机号登录
    async loginWithPhone() {
      if (!this.canLogin) return

      this.loading = true
      
      try {
        // 模拟登录验证
        const response = await this.mockPhoneLogin(this.phoneNumber, this.verifyCode)
        
        // 保存登录信息
        uni.setStorageSync('token', response.token)
        uni.setStorageSync('userInfo', response.userInfo)
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 跳转到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
        
      } catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 微信授权登录
    async onGetUserInfo(e) {
      if (!this.agreed) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }

      if (e.detail.errMsg !== 'getUserInfo:ok') {
        uni.showToast({
          title: '授权失败',
          icon: 'none'
        })
        return
      }

      this.loading = true

      try {
        // 获取微信登录code
        const loginRes = await uni.login({
          provider: 'weixin'
        })

        if (loginRes[1].errMsg !== 'login:ok') {
          throw new Error('微信登录失败')
        }

        // 模拟微信登录
        const response = await this.mockWechatLogin(loginRes[1].code, e.detail)
        
        // 保存登录信息
        uni.setStorageSync('token', response.token)
        uni.setStorageSync('userInfo', response.userInfo)
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 跳转到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
        
      } catch (error) {
        console.error('微信登录失败:', error)
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 协议勾选状态改变
    onAgreementChange(e) {
      this.agreed = e.detail.value.length > 0
    },

    // 显示协议内容
    showAgreement(type) {
      const title = type === 'user' ? '用户协议' : '隐私政策'
      const content = type === 'user' ? this.getUserAgreement() : this.getPrivacyPolicy()
      
      uni.showModal({
        title: title,
        content: content,
        showCancel: false,
        confirmText: '我知道了'
      })
    },

    // 获取用户协议内容
    getUserAgreement() {
      return '这里是用户协议的具体内容...'
    },

    // 获取隐私政策内容
    getPrivacyPolicy() {
      return '这里是隐私政策的具体内容...'
    },

    // 模拟API - 发送验证码
    mockSendCode(phone) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90%成功率
            resolve({ success: true })
          } else {
            reject(new Error('发送失败'))
          }
        }, 1000)
      })
    },

    // 模拟API - 手机号登录
    mockPhoneLogin(phone, code) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (code === '123456') { // 模拟验证码
            resolve({
              token: 'mock_token_' + Date.now(),
              userInfo: {
                id: 1,
                phone: phone,
                nickname: '用户' + phone.slice(-4),
                avatar: 'https://picsum.photos/100/100?random=1',
                gender: 0,
                city: '北京市'
              }
            })
          } else {
            reject(new Error('验证码错误'))
          }
        }, 1500)
      })
    },

    // 模拟API - 微信登录
    mockWechatLogin(code, userInfo) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'mock_wechat_token_' + Date.now(),
            userInfo: {
              id: 2,
              openid: 'mock_openid',
              nickname: userInfo.userInfo.nickName,
              avatar: userInfo.userInfo.avatarUrl,
              gender: userInfo.userInfo.gender,
              city: userInfo.userInfo.city
            }
          })
        }, 1500)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.navbar-content {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: 500;
  color: white;
}

.login-content {
  padding: 200rpx 60rpx 60rpx;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 100rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  margin-bottom: 30rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: white;
  margin-bottom: 16rpx;
}

.app-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  flex: 1;
}

.input-group {
  margin-bottom: 60rpx;
}

.input-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 0 30rpx;
  margin-bottom: 30rpx;
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.input-field {
  flex: 1;
  height: 88rpx;
  font-size: 32rpx;
  color: white;
  margin-left: 20rpx;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.code-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  margin-left: 20rpx;
}

.code-btn:disabled {
  opacity: 0.5;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 40rpx;
}

.login-btn:disabled {
  opacity: 0.5;
}

.divider {
  text-align: center;
  margin: 40rpx 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1rpx;
  background: rgba(255, 255, 255, 0.3);
}

.divider-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 30rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
}

.wechat-login-btn {
  width: 100%;
  height: 88rpx;
  background: #1aad19;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-login-text {
  margin-left: 16rpx;
}

.agreement {
  display: flex;
  align-items: flex-start;
  margin-top: 60rpx;
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-left: 16rpx;
}

.link {
  color: #FFD700;
  text-decoration: underline;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>
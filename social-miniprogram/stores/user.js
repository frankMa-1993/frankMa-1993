import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref({
    id: '',
    username: '',
    nickname: '',
    avatar: '',
    phone: '',
    email: '',
    bio: '',
    gender: 0, // 0-未知 1-男 2-女
    birthday: '',
    location: '',
    followers: 0,
    following: 0,
    posts: 0
  })
  
  // 登录状态
  const isLoggedIn = ref(false)
  
  // 登录token
  const token = ref('')
  
  // 计算属性
  const isComplete = computed(() => {
    return userInfo.value.nickname && userInfo.value.avatar
  })
  
  // 登录
  const login = async (loginData) => {
    try {
      // 这里应该调用实际的登录API
      // const response = await api.login(loginData)
      
      // 模拟登录成功
      const mockUser = {
        id: '1',
        username: loginData.username,
        nickname: '用户' + Math.floor(Math.random() * 1000),
        avatar: '/static/default-avatar.png',
        phone: loginData.phone || '',
        email: loginData.email || '',
        bio: '',
        gender: 0,
        birthday: '',
        location: '',
        followers: 0,
        following: 0,
        posts: 0
      }
      
      userInfo.value = mockUser
      isLoggedIn.value = true
      token.value = 'mock_token_' + Date.now()
      
      // 保存到本地存储
      uni.setStorageSync('userInfo', mockUser)
      uni.setStorageSync('token', token.value)
      
      return { success: true, data: mockUser }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: '登录失败，请重试' }
    }
  }
  
  // 注册
  const register = async (registerData) => {
    try {
      // 这里应该调用实际的注册API
      // const response = await api.register(registerData)
      
      // 模拟注册成功
      const mockUser = {
        id: Date.now().toString(),
        username: registerData.username,
        nickname: registerData.nickname || registerData.username,
        avatar: '/static/default-avatar.png',
        phone: registerData.phone || '',
        email: registerData.email || '',
        bio: '',
        gender: 0,
        birthday: '',
        location: '',
        followers: 0,
        following: 0,
        posts: 0
      }
      
      userInfo.value = mockUser
      isLoggedIn.value = true
      token.value = 'mock_token_' + Date.now()
      
      // 保存到本地存储
      uni.setStorageSync('userInfo', mockUser)
      uni.setStorageSync('token', token.value)
      
      return { success: true, data: mockUser }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, message: '注册失败，请重试' }
    }
  }
  
  // 登出
  const logout = () => {
    userInfo.value = {
      id: '',
      username: '',
      nickname: '',
      avatar: '',
      phone: '',
      email: '',
      bio: '',
      gender: 0,
      birthday: '',
      location: '',
      followers: 0,
      following: 0,
      posts: 0
    }
    isLoggedIn.value = false
    token.value = ''
    
    // 清除本地存储
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('token')
  }
  
  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      const savedUserInfo = uni.getStorageSync('userInfo')
      const savedToken = uni.getStorageSync('token')
      
      if (savedUserInfo && savedToken) {
        userInfo.value = savedUserInfo
        token.value = savedToken
        isLoggedIn.value = true
        return true
      }
      return false
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return false
    }
  }
  
  // 更新用户信息
  const updateUserInfo = async (newInfo) => {
    try {
      // 这里应该调用实际的更新API
      // const response = await api.updateUserInfo(newInfo)
      
      // 更新本地数据
      userInfo.value = { ...userInfo.value, ...newInfo }
      
      // 保存到本地存储
      uni.setStorageSync('userInfo', userInfo.value)
      
      return { success: true }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return { success: false, message: '更新失败，请重试' }
    }
  }
  
  // 上传头像
  const uploadAvatar = async (avatarPath) => {
    try {
      // 这里应该调用实际的文件上传API
      // const response = await api.uploadAvatar(avatarPath)
      
      // 模拟上传成功
      const avatarUrl = avatarPath // 实际应该是服务器返回的URL
      userInfo.value.avatar = avatarUrl
      
      // 保存到本地存储
      uni.setStorageSync('userInfo', userInfo.value)
      
      return { success: true, avatarUrl }
    } catch (error) {
      console.error('上传头像失败:', error)
      return { success: false, message: '上传失败，请重试' }
    }
  }
  
  return {
    userInfo,
    isLoggedIn,
    token,
    isComplete,
    login,
    register,
    logout,
    checkLoginStatus,
    updateUserInfo,
    uploadAvatar
  }
})
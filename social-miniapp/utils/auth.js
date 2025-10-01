// 认证相关工具函数

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  const token = uni.getStorageSync('token')
  const userInfo = uni.getStorageSync('userInfo')
  return !!(token && userInfo)
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return uni.getStorageSync('userInfo')
}

/**
 * 获取用户Token
 */
export function getToken() {
  return uni.getStorageSync('token')
}

/**
 * 保存登录信息
 */
export function saveLoginInfo(token, userInfo) {
  uni.setStorageSync('token', token)
  uni.setStorageSync('userInfo', userInfo)
}

/**
 * 清除登录信息
 */
export function clearLoginInfo() {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
  uni.removeStorageSync('publishDraft')
}

/**
 * 检查登录状态，未登录则跳转到登录页
 */
export function checkLogin() {
  if (!isLoggedIn()) {
    uni.reLaunch({
      url: '/pages/login/login'
    })
    return false
  }
  return true
}

/**
 * 微信授权登录
 */
export function wechatLogin() {
  return new Promise((resolve, reject) => {
    // 检查是否支持微信登录
    uni.getProvider({
      service: 'oauth',
      success: (res) => {
        if (res.provider.includes('weixin')) {
          // 微信登录
          uni.login({
            provider: 'weixin',
            success: (loginRes) => {
              if (loginRes.errMsg === 'login:ok') {
                resolve(loginRes.code)
              } else {
                reject(new Error('微信登录失败'))
              }
            },
            fail: (error) => {
              reject(error)
            }
          })
        } else {
          reject(new Error('不支持微信登录'))
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * 获取微信用户信息
 */
export function getWechatUserInfo() {
  return new Promise((resolve, reject) => {
    uni.getUserInfo({
      provider: 'weixin',
      success: (res) => {
        resolve(res.userInfo)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * 检查微信授权状态
 */
export function checkWechatAuth() {
  return new Promise((resolve, reject) => {
    uni.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * 请求微信授权
 */
export function requestWechatAuth() {
  return new Promise((resolve, reject) => {
    uni.authorize({
      scope: 'scope.userInfo',
      success: () => {
        resolve(true)
      },
      fail: () => {
        // 授权失败，引导用户到设置页面
        uni.showModal({
          title: '授权提示',
          content: '需要获取您的微信信息，请到设置页面打开授权',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting['scope.userInfo']) {
                    resolve(true)
                  } else {
                    reject(new Error('用户拒绝授权'))
                  }
                }
              })
            } else {
              reject(new Error('用户拒绝授权'))
            }
          }
        })
      }
    })
  })
}
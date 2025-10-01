// 通用工具函数

/**
 * 格式化时间
 * @param {number|string|Date} timestamp 时间戳或时间字符串
 * @param {string} format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 */
export function formatTime(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  const date = new Date(timestamp)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化相对时间
 * @param {number|string|Date} timestamp 时间戳
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - new Date(timestamp).getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param {number} num 数字
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return num
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化计数（如点赞数、评论数）
 * @param {number} count 数量
 */
export function formatCount(count) {
  if (count < 1000) {
    return count.toString()
  } else if (count < 10000) {
    return (count / 1000).toFixed(1) + 'K'
  } else if (count < 100000000) {
    return (count / 10000).toFixed(1) + 'W'
  } else {
    return (count / 100000000).toFixed(1) + '亿'
  }
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间（毫秒）
 */
export function debounce(func, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} delay 间隔时间（毫秒）
 */
export function throttle(func, delay) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 * @param {any} obj 要拷贝的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 生成随机字符串
 * @param {number} length 长度
 */
export function randomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 */
export function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证邮箱
 * @param {string} email 邮箱
 */
export function validateEmail(email) {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

/**
 * 获取图片信息
 * @param {string} src 图片路径
 */
export function getImageInfo(src) {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 压缩图片
 * @param {string} src 图片路径
 * @param {number} quality 压缩质量 0-1
 */
export function compressImage(src, quality = 0.8) {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src,
      quality,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 选择图片
 * @param {object} options 选项
 */
export function chooseImage(options = {}) {
  const defaultOptions = {
    count: 9,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera']
  }
  
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      ...defaultOptions,
      ...options,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 预览图片
 * @param {array} urls 图片链接数组
 * @param {number} current 当前显示图片索引
 */
export function previewImage(urls, current = 0) {
  uni.previewImage({
    urls,
    current: typeof current === 'number' ? urls[current] : current
  })
}

/**
 * 复制到剪贴板
 * @param {string} data 要复制的内容
 */
export function copyToClipboard(data) {
  return new Promise((resolve, reject) => {
    uni.setClipboardData({
      data,
      success: () => {
        uni.showToast({
          title: '复制成功',
          icon: 'success'
        })
        resolve()
      },
      fail: reject
    })
  })
}

/**
 * 显示Toast
 * @param {string} title 提示内容
 * @param {string} icon 图标类型
 * @param {number} duration 显示时长
 */
export function showToast(title, icon = 'none', duration = 2000) {
  uni.showToast({
    title,
    icon,
    duration
  })
}

/**
 * 显示Modal
 * @param {string} title 标题
 * @param {string} content 内容
 * @param {object} options 其他选项
 */
export function showModal(title, content, options = {}) {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      ...options,
      success: resolve
    })
  })
}

/**
 * 获取系统信息
 */
export function getSystemInfo() {
  return new Promise((resolve, reject) => {
    uni.getSystemInfo({
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 获取位置信息
 */
export function getLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'wgs84',
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 选择位置
 */
export function chooseLocation() {
  return new Promise((resolve, reject) => {
    uni.chooseLocation({
      success: resolve,
      fail: reject
    })
  })
}
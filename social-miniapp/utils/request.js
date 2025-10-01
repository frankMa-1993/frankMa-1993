// HTTP请求工具类
class Request {
  constructor() {
    this.baseURL = 'https://your-api-domain.com/api'
    this.timeout = 10000
    this.header = {
      'Content-Type': 'application/json'
    }
  }

  // 请求拦截器
  interceptRequest(config) {
    // 添加token
    const token = uni.getStorageSync('token')
    if (token) {
      config.header.Authorization = `Bearer ${token}`
    }
    
    // 显示加载提示
    if (config.loading !== false) {
      uni.showLoading({
        title: config.loadingText || '加载中...',
        mask: true
      })
    }
    
    return config
  }

  // 响应拦截器
  interceptResponse(response, config) {
    // 隐藏加载提示
    if (config.loading !== false) {
      uni.hideLoading()
    }

    const { statusCode, data } = response
    
    // HTTP状态码检查
    if (statusCode !== 200) {
      this.handleHttpError(statusCode)
      return Promise.reject(new Error(`HTTP Error: ${statusCode}`))
    }

    // 业务状态码检查
    if (data.code !== 200) {
      this.handleBusinessError(data.code, data.message)
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    return data.data
  }

  // HTTP错误处理
  handleHttpError(statusCode) {
    let message = '网络错误'
    
    switch (statusCode) {
      case 401:
        message = '未授权，请重新登录'
        this.handleUnauthorized()
        break
      case 403:
        message = '拒绝访问'
        break
      case 404:
        message = '请求地址不存在'
        break
      case 500:
        message = '服务器内部错误'
        break
      case 502:
        message = '网关错误'
        break
      case 503:
        message = '服务不可用'
        break
      case 504:
        message = '网关超时'
        break
      default:
        message = `连接错误${statusCode}`
    }

    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }

  // 业务错误处理
  handleBusinessError(code, message) {
    switch (code) {
      case 401:
        this.handleUnauthorized()
        break
      case 403:
        uni.showToast({
          title: message || '权限不足',
          icon: 'none'
        })
        break
      default:
        uni.showToast({
          title: message || '请求失败',
          icon: 'none'
        })
    }
  }

  // 处理未授权
  handleUnauthorized() {
    // 清除登录信息
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }

  // 通用请求方法
  request(options) {
    return new Promise((resolve, reject) => {
      // 合并配置
      const config = {
        url: this.baseURL + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: { ...this.header, ...options.header },
        timeout: options.timeout || this.timeout,
        loading: options.loading,
        loadingText: options.loadingText
      }

      // 请求拦截
      const interceptedConfig = this.interceptRequest(config)

      // 发送请求
      uni.request({
        ...interceptedConfig,
        success: (response) => {
          this.interceptResponse(response, config)
            .then(resolve)
            .catch(reject)
        },
        fail: (error) => {
          // 隐藏加载提示
          if (config.loading !== false) {
            uni.hideLoading()
          }

          // 网络错误处理
          let message = '网络连接失败'
          if (error.errMsg) {
            if (error.errMsg.includes('timeout')) {
              message = '请求超时'
            } else if (error.errMsg.includes('fail')) {
              message = '网络连接失败'
            }
          }

          uni.showToast({
            title: message,
            icon: 'none'
          })

          reject(new Error(message))
        }
      })
    })
  }

  // GET请求
  get(url, params = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data: params,
      ...options
    })
  }

  // POST请求
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  // PUT请求
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }

  // DELETE请求
  delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }

  // 文件上传
  upload(url, filePath, options = {}) {
    return new Promise((resolve, reject) => {
      // 添加token
      const token = uni.getStorageSync('token')
      const header = { ...options.header }
      if (token) {
        header.Authorization = `Bearer ${token}`
      }

      // 显示上传进度
      if (options.loading !== false) {
        uni.showLoading({
          title: options.loadingText || '上传中...',
          mask: true
        })
      }

      uni.uploadFile({
        url: this.baseURL + url,
        filePath,
        name: options.name || 'file',
        formData: options.formData || {},
        header,
        success: (response) => {
          if (options.loading !== false) {
            uni.hideLoading()
          }

          try {
            const data = JSON.parse(response.data)
            if (data.code === 200) {
              resolve(data.data)
            } else {
              this.handleBusinessError(data.code, data.message)
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('响应数据解析失败'))
          }
        },
        fail: (error) => {
          if (options.loading !== false) {
            uni.hideLoading()
          }

          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })

          reject(error)
        }
      })
    })
  }
}

// 创建实例
const request = new Request()

export default request
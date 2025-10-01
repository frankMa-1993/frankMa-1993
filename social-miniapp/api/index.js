// API接口统一管理
import request from '../utils/request.js'

// 用户相关接口
export const userApi = {
  // 手机号登录
  loginWithPhone: (phone, code) => {
    return request.post('/auth/login/phone', { phone, code })
  },
  
  // 微信登录
  loginWithWechat: (code, userInfo) => {
    return request.post('/auth/login/wechat', { code, userInfo })
  },
  
  // 发送验证码
  sendCode: (phone) => {
    return request.post('/auth/send-code', { phone })
  },
  
  // 获取用户信息
  getUserInfo: (userId) => {
    return request.get(`/user/${userId}`)
  },
  
  // 更新用户信息
  updateUserInfo: (data) => {
    return request.put('/user/profile', data)
  },
  
  // 获取用户统计信息
  getUserStats: (userId) => {
    return request.get(`/user/${userId}/stats`)
  },
  
  // 关注用户
  followUser: (userId) => {
    return request.post(`/user/${userId}/follow`)
  },
  
  // 取消关注
  unfollowUser: (userId) => {
    return request.delete(`/user/${userId}/follow`)
  },
  
  // 获取关注列表
  getFollowingList: (userId, page = 1, size = 20) => {
    return request.get(`/user/${userId}/following`, { page, size })
  },
  
  // 获取粉丝列表
  getFollowersList: (userId, page = 1, size = 20) => {
    return request.get(`/user/${userId}/followers`, { page, size })
  }
}

// 动态相关接口
export const postApi = {
  // 获取动态列表
  getPostList: (page = 1, size = 10) => {
    return request.get('/posts', { page, size })
  },
  
  // 获取动态详情
  getPostDetail: (postId) => {
    return request.get(`/posts/${postId}`)
  },
  
  // 发布动态
  createPost: (data) => {
    return request.post('/posts', data)
  },
  
  // 删除动态
  deletePost: (postId) => {
    return request.delete(`/posts/${postId}`)
  },
  
  // 点赞动态
  likePost: (postId) => {
    return request.post(`/posts/${postId}/like`)
  },
  
  // 取消点赞
  unlikePost: (postId) => {
    return request.delete(`/posts/${postId}/like`)
  },
  
  // 收藏动态
  favoritePost: (postId) => {
    return request.post(`/posts/${postId}/favorite`)
  },
  
  // 取消收藏
  unfavoritePost: (postId) => {
    return request.delete(`/posts/${postId}/favorite`)
  },
  
  // 获取用户动态
  getUserPosts: (userId, page = 1, size = 10) => {
    return request.get(`/user/${userId}/posts`, { page, size })
  },
  
  // 获取用户收藏
  getUserFavorites: (userId, page = 1, size = 10) => {
    return request.get(`/user/${userId}/favorites`, { page, size })
  }
}

// 评论相关接口
export const commentApi = {
  // 获取评论列表
  getCommentList: (postId, page = 1, size = 10, sort = 'time') => {
    return request.get(`/posts/${postId}/comments`, { page, size, sort })
  },
  
  // 发表评论
  createComment: (postId, data) => {
    return request.post(`/posts/${postId}/comments`, data)
  },
  
  // 删除评论
  deleteComment: (commentId) => {
    return request.delete(`/comments/${commentId}`)
  },
  
  // 点赞评论
  likeComment: (commentId) => {
    return request.post(`/comments/${commentId}/like`)
  },
  
  // 取消点赞评论
  unlikeComment: (commentId) => {
    return request.delete(`/comments/${commentId}/like`)
  },
  
  // 回复评论
  replyComment: (commentId, data) => {
    return request.post(`/comments/${commentId}/reply`, data)
  }
}

// 消息相关接口
export const messageApi = {
  // 获取聊天列表
  getChatList: (page = 1, size = 20) => {
    return request.get('/messages/chats', { page, size })
  },
  
  // 获取聊天记录
  getChatMessages: (userId, page = 1, size = 20) => {
    return request.get(`/messages/chat/${userId}`, { page, size })
  },
  
  // 发送消息
  sendMessage: (userId, data) => {
    return request.post(`/messages/chat/${userId}`, data)
  },
  
  // 获取通知列表
  getNotificationList: (page = 1, size = 20) => {
    return request.get('/messages/notifications', { page, size })
  },
  
  // 标记通知已读
  markNotificationRead: (notificationId) => {
    return request.put(`/messages/notifications/${notificationId}/read`)
  },
  
  // 标记所有通知已读
  markAllNotificationsRead: () => {
    return request.put('/messages/notifications/read-all')
  }
}

// 发现相关接口
export const discoverApi = {
  // 获取热门话题
  getHotTopics: (page = 1, size = 10) => {
    return request.get('/discover/topics/hot', { page, size })
  },
  
  // 获取推荐用户
  getRecommendUsers: (page = 1, size = 10) => {
    return request.get('/discover/users/recommend', { page, size })
  },
  
  // 获取精选动态
  getFeaturedPosts: (page = 1, size = 10) => {
    return request.get('/discover/posts/featured', { page, size })
  },
  
  // 获取附近的人
  getNearbyUsers: (latitude, longitude, page = 1, size = 10) => {
    return request.get('/discover/users/nearby', { latitude, longitude, page, size })
  },
  
  // 搜索用户
  searchUsers: (keyword, page = 1, size = 10) => {
    return request.get('/search/users', { keyword, page, size })
  },
  
  // 搜索动态
  searchPosts: (keyword, page = 1, size = 10) => {
    return request.get('/search/posts', { keyword, page, size })
  },
  
  // 搜索话题
  searchTopics: (keyword, page = 1, size = 10) => {
    return request.get('/search/topics', { keyword, page, size })
  }
}

// 话题相关接口
export const topicApi = {
  // 获取话题详情
  getTopicDetail: (topicId) => {
    return request.get(`/topics/${topicId}`)
  },
  
  // 获取话题动态
  getTopicPosts: (topicId, page = 1, size = 10) => {
    return request.get(`/topics/${topicId}/posts`, { page, size })
  },
  
  // 关注话题
  followTopic: (topicId) => {
    return request.post(`/topics/${topicId}/follow`)
  },
  
  // 取消关注话题
  unfollowTopic: (topicId) => {
    return request.delete(`/topics/${topicId}/follow`)
  }
}

// 文件上传接口
export const uploadApi = {
  // 上传图片
  uploadImage: (filePath, options = {}) => {
    return request.upload('/upload/image', filePath, {
      name: 'image',
      ...options
    })
  },
  
  // 上传视频
  uploadVideo: (filePath, options = {}) => {
    return request.upload('/upload/video', filePath, {
      name: 'video',
      ...options
    })
  },
  
  // 上传音频
  uploadAudio: (filePath, options = {}) => {
    return request.upload('/upload/audio', filePath, {
      name: 'audio',
      ...options
    })
  }
}

// 系统相关接口
export const systemApi = {
  // 获取系统配置
  getSystemConfig: () => {
    return request.get('/system/config')
  },
  
  // 检查版本更新
  checkUpdate: () => {
    return request.get('/system/version')
  },
  
  // 意见反馈
  feedback: (data) => {
    return request.post('/system/feedback', data)
  },
  
  // 举报内容
  report: (data) => {
    return request.post('/system/report', data)
  }
}
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePostStore = defineStore('post', () => {
  // 动态列表
  const posts = ref([])
  
  // 当前用户发布的动态
  const myPosts = ref([])
  
  // 点赞的动态
  const likedPosts = ref([])
  
  // 发布动态
  const publishPost = async (postData) => {
    try {
      // 这里应该调用实际的发布API
      // const response = await api.publishPost(postData)
      
      // 模拟发布成功
      const newPost = {
        id: Date.now().toString(),
        userId: postData.userId,
        username: postData.username,
        userAvatar: postData.userAvatar,
        content: postData.content,
        images: postData.images || [],
        video: postData.video || '',
        location: postData.location || '',
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        commentsList: []
      }
      
      // 添加到动态列表开头
      posts.value.unshift(newPost)
      myPosts.value.unshift(newPost)
      
      return { success: true, data: newPost }
    } catch (error) {
      console.error('发布动态失败:', error)
      return { success: false, message: '发布失败，请重试' }
    }
  }
  
  // 获取动态列表
  const getPosts = async (page = 1, limit = 10) => {
    try {
      // 这里应该调用实际的API
      // const response = await api.getPosts({ page, limit })
      
      // 模拟数据
      if (page === 1) {
        posts.value = generateMockPosts(limit)
      }
      
      return { success: true, data: posts.value }
    } catch (error) {
      console.error('获取动态失败:', error)
      return { success: false, message: '获取动态失败' }
    }
  }
  
  // 获取动态详情
  const getPostDetail = async (postId) => {
    try {
      // 这里应该调用实际的API
      // const response = await api.getPostDetail(postId)
      
      // 从现有数据中查找
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        return { success: true, data: post }
      }
      
      return { success: false, message: '动态不存在' }
    } catch (error) {
      console.error('获取动态详情失败:', error)
      return { success: false, message: '获取动态详情失败' }
    }
  }
  
  // 点赞/取消点赞
  const toggleLike = async (postId) => {
    try {
      // 这里应该调用实际的API
      // const response = await api.toggleLike(postId)
      
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        if (post.isLiked) {
          post.likes--
          post.isLiked = false
          likedPosts.value = likedPosts.value.filter(id => id !== postId)
        } else {
          post.likes++
          post.isLiked = true
          likedPosts.value.push(postId)
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('操作失败:', error)
      return { success: false, message: '操作失败' }
    }
  }
  
  // 添加评论
  const addComment = async (postId, commentData) => {
    try {
      // 这里应该调用实际的API
      // const response = await api.addComment(postId, commentData)
      
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        const newComment = {
          id: Date.now().toString(),
          userId: commentData.userId,
          username: commentData.username,
          userAvatar: commentData.userAvatar,
          content: commentData.content,
          createdAt: new Date().toISOString()
        }
        
        post.commentsList.unshift(newComment)
        post.comments++
      }
      
      return { success: true }
    } catch (error) {
      console.error('添加评论失败:', error)
      return { success: false, message: '评论失败' }
    }
  }
  
  // 删除动态
  const deletePost = async (postId) => {
    try {
      // 这里应该调用实际的API
      // const response = await api.deletePost(postId)
      
      posts.value = posts.value.filter(p => p.id !== postId)
      myPosts.value = myPosts.value.filter(p => p.id !== postId)
      
      return { success: true }
    } catch (error) {
      console.error('删除动态失败:', error)
      return { success: false, message: '删除失败' }
    }
  }
  
  // 生成模拟数据
  const generateMockPosts = (count) => {
    const mockPosts = []
    const usernames = ['小明', '小红', '小李', '小王', '小张', '小刘', '小陈', '小杨']
    const contents = [
      '今天天气真好，心情也很棒！',
      '分享一张美美的照片~',
      '新的一天开始了，加油！',
      '周末愉快，大家都要开心哦',
      '刚看完一部很棒的电影，推荐给大家',
      '美食分享，今天做的菜还不错',
      '运动让人快乐，坚持就是胜利',
      '读书笔记：今天学到了很多新知识'
    ]
    
    for (let i = 0; i < count; i++) {
      const randomUser = usernames[Math.floor(Math.random() * usernames.length)]
      const randomContent = contents[Math.floor(Math.random() * contents.length)]
      
      mockPosts.push({
        id: (Date.now() + i).toString(),
        userId: (i + 1).toString(),
        username: randomUser,
        userAvatar: '/static/default-avatar.png',
        content: randomContent,
        images: Math.random() > 0.5 ? [`/static/mock-image-${i + 1}.jpg`] : [],
        video: '',
        location: Math.random() > 0.7 ? '北京市朝阳区' : '',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        isLiked: Math.random() > 0.8,
        commentsList: []
      })
    }
    
    return mockPosts
  }
  
  return {
    posts,
    myPosts,
    likedPosts,
    publishPost,
    getPosts,
    getPostDetail,
    toggleLike,
    addComment,
    deletePost
  }
})
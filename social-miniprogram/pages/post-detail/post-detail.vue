<template>
	<view class="post-detail-container">
		<!-- 动态详情 -->
		<scroll-view class="detail-content" scroll-y v-if="post">
			<!-- 动态内容 -->
			<view class="post-card">
				<!-- 用户信息 -->
				<view class="post-header">
					<view class="user-info">
						<image 
							class="user-avatar" 
							:src="post.userAvatar || '/static/default-avatar.png'" 
							mode="aspectFill"
							@click="goToUserProfile"
						></image>
						<view class="user-details">
							<text class="username">{{ post.username }}</text>
							<text class="post-time">{{ formatTime(post.createdAt) }}</text>
						</view>
					</view>
					<view class="post-actions">
						<view class="action-btn" @click="showPostMenu">
							<text class="iconfont icon-more"></text>
						</view>
					</view>
				</view>
				
				<!-- 动态内容 -->
				<view class="post-content">
					<text class="content-text">{{ post.content }}</text>
					
					<!-- 图片/视频 -->
					<view class="media-content" v-if="post.images.length > 0 || post.video">
						<view class="images-grid" v-if="post.images.length > 0">
							<image 
								v-for="(image, index) in post.images" 
								:key="index"
								class="post-image" 
								:src="image" 
								mode="aspectFill"
								@click="previewImage(post.images, index)"
							></image>
						</view>
						<view class="video-container" v-if="post.video">
							<video 
								class="post-video" 
								:src="post.video" 
								controls
							></video>
						</view>
					</view>
					
					<!-- 位置信息 -->
					<view class="location-info" v-if="post.location">
						<text class="iconfont icon-location"></text>
						<text class="location-text">{{ post.location }}</text>
					</view>
				</view>
				
				<!-- 互动统计 -->
				<view class="interaction-stats">
					<text class="stats-text" v-if="post.likes > 0">{{ post.likes }} 赞</text>
					<text class="stats-text" v-if="post.comments > 0">{{ post.comments }} 评论</text>
					<text class="stats-text" v-if="post.shares > 0">{{ post.shares }} 分享</text>
				</view>
				
				<!-- 互动按钮 -->
				<view class="interaction-buttons">
					<view 
						class="action-btn" 
						:class="{ 'active': post.isLiked }"
						@click="toggleLike"
					>
						<text class="iconfont" :class="post.isLiked ? 'icon-heart-fill' : 'icon-heart'"></text>
						<text class="action-text">赞</text>
					</view>
					<view class="action-btn" @click="focusCommentInput">
						<text class="iconfont icon-comment"></text>
						<text class="action-text">评论</text>
					</view>
					<view class="action-btn" @click="sharePost">
						<text class="iconfont icon-share"></text>
						<text class="action-text">分享</text>
					</view>
				</view>
			</view>
			
			<!-- 评论列表 -->
			<view class="comments-section">
				<view class="section-title">
					<text class="title-text">评论 {{ post.comments }}</text>
				</view>
				
				<view class="comments-list">
					<view 
						class="comment-item" 
						v-for="comment in comments" 
						:key="comment.id"
					>
						<image 
							class="comment-avatar" 
							:src="comment.userAvatar || '/static/default-avatar.png'" 
							mode="aspectFill"
							@click="goToCommentUserProfile(comment.userId)"
						></image>
						<view class="comment-content">
							<view class="comment-header">
								<text class="comment-username">{{ comment.username }}</text>
								<text class="comment-time">{{ formatTime(comment.createdAt) }}</text>
							</view>
							<text class="comment-text">{{ comment.content }}</text>
							<view class="comment-actions">
								<view class="comment-action" @click="replyToComment(comment)">
									<text class="action-text">回复</text>
								</view>
								<view class="comment-action" @click="likeComment(comment)">
									<text class="action-text">{{ comment.isLiked ? '已赞' : '点赞' }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 加载更多评论 -->
				<view class="load-more-comments" v-if="hasMoreComments && !loadingComments">
					<text class="load-text" @click="loadMoreComments">查看更多评论</text>
				</view>
				
				<!-- 评论加载中 -->
				<view class="loading-comments" v-if="loadingComments">
					<view class="loading-spinner"></view>
					<text class="loading-text">加载中...</text>
				</view>
			</view>
		</scroll-view>
		
		<!-- 评论输入框 -->
		<view class="comment-input-bar">
			<view class="input-container">
				<input 
					class="comment-input" 
					:placeholder="replyPlaceholder"
					v-model="commentText"
					:focus="commentInputFocus"
					@focus="onCommentFocus"
					@blur="onCommentBlur"
				/>
				<button 
					class="send-btn" 
					:disabled="!commentText.trim()"
					@click="sendComment"
				>
					发送
				</button>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>
	</view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { usePostStore } from '../../stores/post'

export default {
	name: 'PostDetail',
	setup() {
		const userStore = useUserStore()
		const postStore = usePostStore()
		
		// 响应式数据
		const post = ref(null)
		const comments = ref([])
		const loading = ref(true)
		const loadingComments = ref(false)
		const hasMoreComments = ref(true)
		const commentText = ref('')
		const commentInputFocus = ref(false)
		const replyComment = ref(null)
		const commentsPage = ref(1)
		
		// 计算属性
		const userInfo = computed(() => userStore.userInfo)
		
		const replyPlaceholder = computed(() => {
			if (replyComment.value) {
				return `回复 ${replyComment.value.username}：`
			}
			return '写评论...'
		})
		
		// 格式化时间
		const formatTime = (timeStr) => {
			const now = new Date()
			const time = new Date(timeStr)
			const diff = now - time
			
			if (diff < 60000) {
				return '刚刚'
			} else if (diff < 3600000) {
				return Math.floor(diff / 60000) + '分钟前'
			} else if (diff < 86400000) {
				return Math.floor(diff / 3600000) + '小时前'
			} else if (diff < 604800000) {
				return Math.floor(diff / 86400000) + '天前'
			} else {
				return time.toLocaleDateString()
			}
		}
		
		// 获取动态详情
		const getPostDetail = async () => {
			try {
				const pages = getCurrentPages()
				const currentPage = pages[pages.length - 1]
				const postId = currentPage.options.id
				
				if (!postId) {
					uni.showToast({
						title: '参数错误',
						icon: 'none'
					})
					return
				}
				
				const result = await postStore.getPostDetail(postId)
				if (result.success) {
					post.value = result.data
					// 获取评论
					await getComments()
				} else {
					uni.showToast({
						title: result.message || '获取动态失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('获取动态详情失败:', error)
				uni.showToast({
					title: '获取动态失败',
					icon: 'none'
				})
			} finally {
				loading.value = false
			}
		}
		
		// 获取评论列表
		const getComments = async (page = 1, isRefresh = false) => {
			if (loadingComments.value) return
			
			loadingComments.value = true
			try {
				// 这里应该调用实际的API获取评论
				// 模拟数据
				const mockComments = generateMockComments(page)
				
				if (isRefresh || page === 1) {
					comments.value = mockComments
				} else {
					comments.value.push(...mockComments)
				}
				
				if (mockComments.length < 10) {
					hasMoreComments.value = false
				}
				commentsPage.value = page
			} catch (error) {
				console.error('获取评论失败:', error)
			} finally {
				loadingComments.value = false
			}
		}
		
		// 生成模拟评论数据
		const generateMockComments = (page) => {
			const mockComments = []
			const usernames = ['小明', '小红', '小李', '小王', '小张']
			const contents = [
				'说得很对！',
				'我也这么觉得',
				'哈哈哈',
				'学到了',
				'很有道理',
				'赞同',
				'不错不错',
				'支持支持'
			]
			
			for (let i = 0; i < 5; i++) {
				const randomUser = usernames[Math.floor(Math.random() * usernames.length)]
				const randomContent = contents[Math.floor(Math.random() * contents.length)]
				
				mockComments.push({
					id: (Date.now() + i + page * 10).toString(),
					userId: (i + 1).toString(),
					username: randomUser,
					userAvatar: '/static/default-avatar.png',
					content: randomContent,
					createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
					isLiked: Math.random() > 0.8
				})
			}
			
			return mockComments
		}
		
		// 加载更多评论
		const loadMoreComments = () => {
			getComments(commentsPage.value + 1)
		}
		
		// 切换点赞
		const toggleLike = async () => {
			try {
				const result = await postStore.toggleLike(post.value.id)
				if (result.success) {
					// 点赞状态已经在store中更新
				}
			} catch (error) {
				console.error('点赞失败:', error)
			}
		}
		
		// 预览图片
		const previewImage = (images, current) => {
			uni.previewImage({
				urls: images,
				current: current
			})
		}
		
		// 分享动态
		const sharePost = () => {
			uni.showActionSheet({
				itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
				success: (res) => {
					const index = res.tapIndex
					switch (index) {
						case 0:
						case 1:
							uni.showToast({
								title: '分享功能开发中',
								icon: 'none'
							})
							break
						case 2:
							uni.setClipboardData({
								data: `https://example.com/post/${post.value.id}`,
								success: () => {
									uni.showToast({
										title: '链接已复制',
										icon: 'success'
									})
								}
							})
							break
					}
				}
			})
		}
		
		// 显示动态菜单
		const showPostMenu = () => {
			const itemList = []
			if (post.value.userId === userInfo.value.id) {
				itemList.push('删除动态')
			} else {
				itemList.push('举报动态')
				itemList.push('屏蔽用户')
			}
			
			uni.showActionSheet({
				itemList: itemList,
				success: (res) => {
					const index = res.tapIndex
					if (itemList[index] === '删除动态') {
						deletePost()
					} else if (itemList[index] === '举报动态') {
						reportPost()
					} else if (itemList[index] === '屏蔽用户') {
						blockUser()
					}
				}
			})
		}
		
		// 删除动态
		const deletePost = async () => {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这条动态吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const result = await postStore.deletePost(post.value.id)
							if (result.success) {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
								setTimeout(() => {
									uni.navigateBack()
								}, 1500)
							}
						} catch (error) {
							console.error('删除失败:', error)
						}
					}
				}
			})
		}
		
		// 举报动态
		const reportPost = () => {
			uni.showToast({
				title: '举报功能开发中',
				icon: 'none'
			})
		}
		
		// 屏蔽用户
		const blockUser = () => {
			uni.showModal({
				title: '确认屏蔽',
				content: '确定要屏蔽该用户吗？',
				success: (res) => {
					if (res.confirm) {
						uni.showToast({
							title: '屏蔽功能开发中',
							icon: 'none'
						})
					}
				}
			})
		}
		
		// 焦点评论输入框
		const focusCommentInput = () => {
			commentInputFocus.value = true
		}
		
		// 评论输入框焦点事件
		const onCommentFocus = () => {
			// 可以在这里添加一些逻辑
		}
		
		// 评论输入框失焦事件
		const onCommentBlur = () => {
			commentInputFocus.value = false
			// 延迟清除回复状态，避免发送时出错
			setTimeout(() => {
				if (!commentInputFocus.value) {
					replyComment.value = null
				}
			}, 100)
		}
		
		// 发送评论
		const sendComment = async () => {
			if (!commentText.value.trim()) return
			
			try {
				const commentData = {
					userId: userInfo.value.id,
					username: userInfo.value.nickname || userInfo.value.username,
					userAvatar: userInfo.value.avatar,
					content: commentText.value.trim(),
					replyTo: replyComment.value?.id || null
				}
				
				const result = await postStore.addComment(post.value.id, commentData)
				if (result.success) {
					commentText.value = ''
					replyComment.value = null
					commentInputFocus.value = false
					
					// 刷新评论列表
					await getComments(1, true)
				}
			} catch (error) {
				console.error('发送评论失败:', error)
				uni.showToast({
					title: '发送失败，请重试',
					icon: 'none'
				})
			}
		}
		
		// 回复评论
		const replyToComment = (comment) => {
			replyComment.value = comment
			commentInputFocus.value = true
		}
		
		// 点赞评论
		const likeComment = (comment) => {
			comment.isLiked = !comment.isLiked
			uni.showToast({
				title: comment.isLiked ? '已点赞' : '已取消',
				icon: 'none'
			})
		}
		
		// 页面跳转
		const goToUserProfile = () => {
			uni.navigateTo({
				url: `/pages/user-profile/user-profile?userId=${post.value.userId}`
			})
		}
		
		const goToCommentUserProfile = (userId) => {
			uni.navigateTo({
				url: `/pages/user-profile/user-profile?userId=${userId}`
			})
		}
		
		// 页面加载时获取数据
		onMounted(() => {
			getPostDetail()
		})
		
		return {
			post,
			comments,
			loading,
			loadingComments,
			hasMoreComments,
			commentText,
			commentInputFocus,
			replyComment,
			userInfo,
			replyPlaceholder,
			formatTime,
			loadMoreComments,
			toggleLike,
			previewImage,
			sharePost,
			showPostMenu,
			focusCommentInput,
			onCommentFocus,
			onCommentBlur,
			sendComment,
			replyToComment,
			likeComment,
			goToUserProfile,
			goToCommentUserProfile
		}
	}
}
</script>

<style lang="scss" scoped>
.post-detail-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f5f5f5;
}

/* 详情内容 */
.detail-content {
	flex: 1;
	padding-bottom: 120rpx; /* 为评论输入框留出空间 */
}

/* 动态卡片 */
.post-card {
	background: #fff;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	
	.post-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
		
		.user-info {
			display: flex;
			align-items: center;
			
			.user-avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				margin-right: 20rpx;
			}
			
			.user-details {
				.username {
					display: block;
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 8rpx;
				}
				
				.post-time {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
		
		.post-actions {
			.action-btn {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.iconfont {
					font-size: 36rpx;
					color: #999;
				}
			}
		}
	}
	
	.post-content {
		margin-bottom: 20rpx;
		
		.content-text {
			font-size: 30rpx;
			color: #333;
			line-height: 1.6;
			display: block;
			margin-bottom: 20rpx;
		}
		
		.media-content {
			margin-bottom: 20rpx;
			
			.images-grid {
				display: grid;
				gap: 10rpx;
				
				.post-image {
					width: 100%;
					height: 200rpx;
					border-radius: 12rpx;
					
					&:first-child {
						height: 300rpx;
					}
				}
			}
			
			.video-container {
				.post-video {
					width: 100%;
					height: 400rpx;
					border-radius: 12rpx;
				}
			}
		}
		
		.location-info {
			display: flex;
			align-items: center;
			
			.iconfont {
				font-size: 28rpx;
				color: #999;
				margin-right: 8rpx;
			}
			
			.location-text {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
	
	.interaction-stats {
		margin-bottom: 16rpx;
		
		.stats-text {
			font-size: 24rpx;
			color: #999;
			margin-right: 20rpx;
		}
	}
	
	.interaction-buttons {
		display: flex;
		align-items: center;
		border-top: 1px solid #f0f0f0;
		padding-top: 20rpx;
		
		.action-btn {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 16rpx 0;
			
			&.active {
				.iconfont {
					color: #ff3b30;
				}
				
				.action-text {
					color: #ff3b30;
				}
			}
			
			.iconfont {
				font-size: 32rpx;
				color: #999;
				margin-right: 8rpx;
			}
			
			.action-text {
				font-size: 28rpx;
				color: #999;
			}
		}
	}
}

/* 评论区域 */
.comments-section {
	background: #fff;
	margin: 0 20rpx 20rpx;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	
	.section-title {
		margin-bottom: 20rpx;
		
		.title-text {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}
	}
	
	.comments-list {
		.comment-item {
			display: flex;
			margin-bottom: 30rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.comment-avatar {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				margin-right: 16rpx;
			}
			
			.comment-content {
				flex: 1;
				
				.comment-header {
					display: flex;
					align-items: center;
					margin-bottom: 8rpx;
					
					.comment-username {
						font-size: 28rpx;
						font-weight: 600;
						color: #333;
						margin-right: 12rpx;
					}
					
					.comment-time {
						font-size: 22rpx;
						color: #999;
					}
				}
				
				.comment-text {
					font-size: 28rpx;
					color: #333;
					line-height: 1.5;
					margin-bottom: 12rpx;
				}
				
				.comment-actions {
					display: flex;
					
					.comment-action {
						margin-right: 20rpx;
						
						.action-text {
							font-size: 24rpx;
							color: #007aff;
						}
					}
				}
			}
		}
	}
	
	.load-more-comments {
		text-align: center;
		padding: 20rpx 0;
		
		.load-text {
			font-size: 28rpx;
			color: #007aff;
		}
	}
	
	.loading-comments {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		
		.loading-spinner {
			width: 32rpx;
			height: 32rpx;
			border: 3rpx solid #f0f0f0;
			border-top: 3rpx solid #007aff;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin-right: 12rpx;
		}
		
		.loading-text {
			font-size: 24rpx;
			color: #999;
		}
	}
}

/* 评论输入框 */
.comment-input-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	border-top: 1px solid #e5e5e5;
	padding: 20rpx 30rpx;
	z-index: 100;
	
	.input-container {
		display: flex;
		align-items: center;
		
		.comment-input {
			flex: 1;
			height: 72rpx;
			background: #f8f9fa;
			border-radius: 36rpx;
			padding: 0 24rpx;
			font-size: 28rpx;
			color: #333;
			margin-right: 20rpx;
		}
		
		.send-btn {
			width: 120rpx;
			height: 72rpx;
			background: #007aff;
			color: #fff;
			border: none;
			border-radius: 36rpx;
			font-size: 28rpx;
			
			&:disabled {
				background: #f0f0f0;
				color: #999;
			}
		}
	}
}

/* 加载状态 */
.loading-container {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	align-items: center;
	z-index: 1000;
	
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 6rpx solid #f0f0f0;
		border-top: 6rpx solid #007aff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20rpx;
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #999;
	}
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
</style>
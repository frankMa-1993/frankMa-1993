<template>
	<view class="index-container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<view class="navbar-left">
					<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
					<text class="app-title">社交小程序</text>
				</view>
				<view class="navbar-right">
					<view class="nav-icon" @click="goToSearch">
						<text class="iconfont icon-search"></text>
					</view>
					<view class="nav-icon" @click="goToNotification">
						<text class="iconfont icon-bell"></text>
						<view class="badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 动态列表 -->
		<scroll-view 
			class="posts-container" 
			scroll-y 
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="onLoadMore"
		>
			<!-- 发布动态入口 -->
			<view class="publish-entry" @click="goToPublish">
				<view class="user-avatar">
					<image :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
				</view>
				<view class="publish-text">
					<text>分享你的想法...</text>
				</view>
				<view class="publish-icon">
					<text class="iconfont icon-camera"></text>
				</view>
			</view>
			
			<!-- 动态列表 -->
			<view class="posts-list">
				<view 
					class="post-item" 
					v-for="post in posts" 
					:key="post.id"
					@click="goToPostDetail(post.id)"
				>
					<!-- 用户信息 -->
					<view class="post-header">
						<view class="user-info">
							<image 
								class="user-avatar" 
								:src="post.userAvatar || '/static/default-avatar.png'" 
								mode="aspectFill"
								@click.stop="goToUserProfile(post.userId)"
							></image>
							<view class="user-details">
								<text class="username">{{ post.username }}</text>
								<text class="post-time">{{ formatTime(post.createdAt) }}</text>
							</view>
						</view>
						<view class="post-actions">
							<view class="action-btn" @click.stop="showPostMenu(post)">
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
									@click.stop="previewImage(post.images, index)"
								></image>
							</view>
							<view class="video-container" v-if="post.video">
								<video 
									class="post-video" 
									:src="post.video" 
									controls
									@click.stop
								></video>
							</view>
						</view>
						
						<!-- 位置信息 -->
						<view class="location-info" v-if="post.location">
							<text class="iconfont icon-location"></text>
							<text class="location-text">{{ post.location }}</text>
						</view>
					</view>
					
					<!-- 互动操作 -->
					<view class="post-footer">
						<view class="interaction-stats">
							<text class="stats-text" v-if="post.likes > 0">{{ post.likes }} 赞</text>
							<text class="stats-text" v-if="post.comments > 0">{{ post.comments }} 评论</text>
							<text class="stats-text" v-if="post.shares > 0">{{ post.shares }} 分享</text>
						</view>
						<view class="interaction-buttons">
							<view 
								class="action-btn" 
								:class="{ 'active': post.isLiked }"
								@click.stop="toggleLike(post)"
							>
								<text class="iconfont" :class="post.isLiked ? 'icon-heart-fill' : 'icon-heart'"></text>
								<text class="action-text">赞</text>
							</view>
							<view class="action-btn" @click.stop="goToPostDetail(post.id)">
								<text class="iconfont icon-comment"></text>
								<text class="action-text">评论</text>
							</view>
							<view class="action-btn" @click.stop="sharePost(post)">
								<text class="iconfont icon-share"></text>
								<text class="action-text">分享</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载更多 -->
			<view class="load-more" v-if="loading">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
			
			<!-- 没有更多数据 -->
			<view class="no-more" v-if="!hasMore && posts.length > 0">
				<text class="no-more-text">没有更多动态了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { usePostStore } from '../../stores/post'

export default {
	name: 'Index',
	setup() {
		const userStore = useUserStore()
		const postStore = usePostStore()
		
		// 响应式数据
		const posts = ref([])
		const loading = ref(false)
		const refreshing = ref(false)
		const hasMore = ref(true)
		const currentPage = ref(1)
		const unreadCount = ref(0)
		
		// 计算属性
		const userInfo = computed(() => userStore.userInfo)
		
		// 格式化时间
		const formatTime = (timeStr) => {
			const now = new Date()
			const time = new Date(timeStr)
			const diff = now - time
			
			if (diff < 60000) { // 1分钟内
				return '刚刚'
			} else if (diff < 3600000) { // 1小时内
				return Math.floor(diff / 60000) + '分钟前'
			} else if (diff < 86400000) { // 1天内
				return Math.floor(diff / 3600000) + '小时前'
			} else if (diff < 604800000) { // 1周内
				return Math.floor(diff / 86400000) + '天前'
			} else {
				return time.toLocaleDateString()
			}
		}
		
		// 获取动态列表
		const getPosts = async (page = 1, isRefresh = false) => {
			if (loading.value) return
			
			loading.value = true
			try {
				const result = await postStore.getPosts(page)
				if (result.success) {
					if (isRefresh || page === 1) {
						posts.value = result.data
					} else {
						posts.value.push(...result.data)
					}
					
					if (result.data.length < 10) {
						hasMore.value = false
					}
					currentPage.value = page
				}
			} catch (error) {
				console.error('获取动态失败:', error)
				uni.showToast({
					title: '获取动态失败',
					icon: 'none'
				})
			} finally {
				loading.value = false
				refreshing.value = false
			}
		}
		
		// 下拉刷新
		const onRefresh = () => {
			refreshing.value = true
			hasMore.value = true
			getPosts(1, true)
		}
		
		// 上拉加载更多
		const onLoadMore = () => {
			if (hasMore.value && !loading.value) {
				getPosts(currentPage.value + 1)
			}
		}
		
		// 切换点赞
		const toggleLike = async (post) => {
			try {
				const result = await postStore.toggleLike(post.id)
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
		const sharePost = (post) => {
			uni.showActionSheet({
				itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
				success: (res) => {
					const index = res.tapIndex
					switch (index) {
						case 0:
							// 分享给朋友
							uni.showToast({
								title: '分享功能开发中',
								icon: 'none'
							})
							break
						case 1:
							// 分享到朋友圈
							uni.showToast({
								title: '分享功能开发中',
								icon: 'none'
							})
							break
						case 2:
							// 复制链接
							uni.setClipboardData({
								data: `https://example.com/post/${post.id}`,
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
		const showPostMenu = (post) => {
			const itemList = []
			if (post.userId === userInfo.value.id) {
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
						deletePost(post)
					} else if (itemList[index] === '举报动态') {
						reportPost(post)
					} else if (itemList[index] === '屏蔽用户') {
						blockUser(post)
					}
				}
			})
		}
		
		// 删除动态
		const deletePost = async (post) => {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这条动态吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const result = await postStore.deletePost(post.id)
							if (result.success) {
								posts.value = posts.value.filter(p => p.id !== post.id)
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
							}
						} catch (error) {
							console.error('删除失败:', error)
						}
					}
				}
			})
		}
		
		// 举报动态
		const reportPost = (post) => {
			uni.showToast({
				title: '举报功能开发中',
				icon: 'none'
			})
		}
		
		// 屏蔽用户
		const blockUser = (post) => {
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
		
		// 页面跳转
		const goToPublish = () => {
			uni.navigateTo({
				url: '/pages/publish/publish'
			})
		}
		
		const goToPostDetail = (postId) => {
			uni.navigateTo({
				url: `/pages/post-detail/post-detail?id=${postId}`
			})
		}
		
		const goToUserProfile = (userId) => {
			uni.navigateTo({
				url: `/pages/user-profile/user-profile?userId=${userId}`
			})
		}
		
		const goToSearch = () => {
			uni.showToast({
				title: '搜索功能开发中',
				icon: 'none'
			})
		}
		
		const goToNotification = () => {
			uni.showToast({
				title: '通知功能开发中',
				icon: 'none'
			})
		}
		
		// 页面加载时获取数据
		onMounted(() => {
			getPosts(1)
		})
		
		return {
			posts,
			loading,
			refreshing,
			hasMore,
			unreadCount,
			userInfo,
			formatTime,
			onRefresh,
			onLoadMore,
			toggleLike,
			previewImage,
			sharePost,
			showPostMenu,
			goToPublish,
			goToPostDetail,
			goToUserProfile,
			goToSearch,
			goToNotification
		}
	}
}
</script>

<style lang="scss" scoped>
.index-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f5f5f5;
}

/* 自定义导航栏 */
.custom-navbar {
	background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
	padding-top: 44rpx;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	
	.navbar-content {
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		
		.navbar-left {
			display: flex;
			align-items: center;
			
			.logo {
				width: 48rpx;
				height: 48rpx;
				margin-right: 16rpx;
			}
			
			.app-title {
				font-size: 36rpx;
				font-weight: 600;
				color: #fff;
			}
		}
		
		.navbar-right {
			display: flex;
			align-items: center;
			
			.nav-icon {
				position: relative;
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 20rpx;
				
				.iconfont {
					font-size: 40rpx;
					color: #fff;
				}
				
				.badge {
					position: absolute;
					top: 8rpx;
					right: 8rpx;
					min-width: 32rpx;
					height: 32rpx;
					background: #ff3b30;
					border-radius: 16rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 20rpx;
					color: #fff;
					padding: 0 8rpx;
				}
			}
		}
	}
}

/* 动态列表容器 */
.posts-container {
	flex: 1;
	padding-top: 132rpx; /* 导航栏高度 */
}

/* 发布入口 */
.publish-entry {
	background: #fff;
	margin: 20rpx 30rpx;
	border-radius: 16rpx;
	padding: 30rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	
	.user-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 20rpx;
		
		image {
			width: 100%;
			height: 100%;
		}
	}
	
	.publish-text {
		flex: 1;
		
		text {
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.publish-icon {
		.iconfont {
			font-size: 40rpx;
			color: #007aff;
		}
	}
}

/* 动态列表 */
.posts-list {
	.post-item {
		background: #fff;
		margin: 0 30rpx 20rpx;
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
					overflow: hidden;
					margin-right: 20rpx;
					
					image {
						width: 100%;
						height: 100%;
					}
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
					
					&.single {
						grid-template-columns: 1fr;
					}
					
					&.double {
						grid-template-columns: 1fr 1fr;
					}
					
					&.triple {
						grid-template-columns: 1fr 1fr;
						
						.post-image:first-child {
							grid-row: span 2;
						}
					}
					
					&.multiple {
						grid-template-columns: 1fr 1fr 1fr;
					}
					
					.post-image {
						width: 100%;
						height: 200rpx;
						border-radius: 12rpx;
						overflow: hidden;
						
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
		
		.post-footer {
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
	}
}

/* 加载更多 */
.load-more {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	
	.loading-spinner {
		width: 40rpx;
		height: 40rpx;
		border: 4rpx solid #f0f0f0;
		border-top: 4rpx solid #007aff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 16rpx;
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

/* 没有更多数据 */
.no-more {
	text-align: center;
	padding: 40rpx;
	
	.no-more-text {
		font-size: 28rpx;
		color: #999;
	}
}
</style>
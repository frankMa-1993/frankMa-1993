<template>
	<view class="discover-container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input" @click="goToSearch">
				<text class="iconfont icon-search"></text>
				<text class="search-placeholder">搜索用户、话题...</text>
			</view>
		</view>
		
		<!-- 发现内容 -->
		<scroll-view class="discover-content" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
			<!-- 推荐用户 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">推荐用户</text>
					<text class="section-more" @click="goToMoreUsers">查看更多</text>
				</view>
				<scroll-view class="users-scroll" scroll-x>
					<view class="users-list">
						<view 
							class="user-item" 
							v-for="user in recommendedUsers" 
							:key="user.id"
							@click="goToUserProfile(user.id)"
						>
							<image class="user-avatar" :src="user.avatar" mode="aspectFill"></image>
							<text class="user-name">{{ user.nickname }}</text>
							<button 
								class="follow-btn" 
								:class="{ 'following': user.isFollowing }"
								@click.stop="toggleFollow(user)"
							>
								{{ user.isFollowing ? '已关注' : '关注' }}
							</button>
						</view>
					</view>
				</scroll-view>
			</view>
			
			<!-- 热门话题 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">热门话题</text>
					<text class="section-more" @click="goToMoreTopics">查看更多</text>
				</view>
				<view class="topics-grid">
					<view 
						class="topic-item" 
						v-for="topic in hotTopics" 
						:key="topic.id"
						@click="goToTopicDetail(topic.id)"
					>
						<text class="topic-name">#{{ topic.name }}</text>
						<text class="topic-count">{{ topic.posts }} 条动态</text>
					</view>
				</view>
			</view>
			
			<!-- 热门动态 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">热门动态</text>
				</view>
				<view class="posts-list">
					<view 
						class="post-item" 
						v-for="post in hotPosts" 
						:key="post.id"
						@click="goToPostDetail(post.id)"
					>
						<view class="post-header">
							<image 
								class="user-avatar" 
								:src="post.userAvatar" 
								mode="aspectFill"
								@click.stop="goToUserProfile(post.userId)"
							></image>
							<view class="user-info">
								<text class="username">{{ post.username }}</text>
								<text class="post-time">{{ formatTime(post.createdAt) }}</text>
							</view>
							<view class="post-stats">
								<text class="stat-item">{{ post.likes }} 赞</text>
							</view>
						</view>
						<text class="post-content">{{ post.content }}</text>
						<view class="post-images" v-if="post.images.length > 0">
							<image 
								v-for="(image, index) in post.images.slice(0, 3)" 
								:key="index"
								class="post-image" 
								:src="image" 
								mode="aspectFill"
							></image>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
	name: 'Discover',
	setup() {
		// 响应式数据
		const refreshing = ref(false)
		const recommendedUsers = ref([])
		const hotTopics = ref([])
		const hotPosts = ref([])
		
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
			} else {
				return Math.floor(diff / 86400000) + '天前'
			}
		}
		
		// 获取推荐用户
		const getRecommendedUsers = () => {
			const mockUsers = []
			const names = ['小明', '小红', '小李', '小王', '小张', '小刘', '小陈', '小杨']
			
			for (let i = 0; i < 8; i++) {
				mockUsers.push({
					id: (i + 1).toString(),
					nickname: names[i % names.length] + i,
					avatar: '/static/default-avatar.png',
					isFollowing: Math.random() > 0.7
				})
			}
			
			recommendedUsers.value = mockUsers
		}
		
		// 获取热门话题
		const getHotTopics = () => {
			const mockTopics = [
				{ id: '1', name: '今日心情', posts: 1234 },
				{ id: '2', name: '美食分享', posts: 856 },
				{ id: '3', name: '旅行日记', posts: 642 },
				{ id: '4', name: '学习打卡', posts: 789 },
				{ id: '5', name: '健身日常', posts: 567 },
				{ id: '6', name: '电影推荐', posts: 445 }
			]
			
			hotTopics.value = mockTopics
		}
		
		// 获取热门动态
		const getHotPosts = () => {
			const mockPosts = []
			const usernames = ['小明', '小红', '小李', '小王', '小张']
			const contents = [
				'今天天气真好，心情也很棒！',
				'分享一张美美的照片~',
				'新的一天开始了，加油！',
				'周末愉快，大家都要开心哦',
				'刚看完一部很棒的电影，推荐给大家'
			]
			
			for (let i = 0; i < 5; i++) {
				mockPosts.push({
					id: (i + 1).toString(),
					userId: (i + 1).toString(),
					username: usernames[i],
					userAvatar: '/static/default-avatar.png',
					content: contents[i],
					images: Math.random() > 0.5 ? [`/static/mock-image-${i + 1}.jpg`] : [],
					createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
					likes: Math.floor(Math.random() * 100) + 10
				})
			}
			
			hotPosts.value = mockPosts
		}
		
		// 下拉刷新
		const onRefresh = () => {
			refreshing.value = true
			loadData()
			setTimeout(() => {
				refreshing.value = false
			}, 1000)
		}
		
		// 加载数据
		const loadData = () => {
			getRecommendedUsers()
			getHotTopics()
			getHotPosts()
		}
		
		// 切换关注状态
		const toggleFollow = (user) => {
			user.isFollowing = !user.isFollowing
			uni.showToast({
				title: user.isFollowing ? '已关注' : '已取消关注',
				icon: 'none'
			})
		}
		
		// 页面跳转
		const goToSearch = () => {
			uni.showToast({
				title: '搜索功能开发中',
				icon: 'none'
			})
		}
		
		const goToMoreUsers = () => {
			uni.showToast({
				title: '更多用户功能开发中',
				icon: 'none'
			})
		}
		
		const goToMoreTopics = () => {
			uni.showToast({
				title: '更多话题功能开发中',
				icon: 'none'
			})
		}
		
		const goToUserProfile = (userId) => {
			uni.navigateTo({
				url: `/pages/user-profile/user-profile?userId=${userId}`
			})
		}
		
		const goToTopicDetail = (topicId) => {
			uni.showToast({
				title: '话题详情功能开发中',
				icon: 'none'
			})
		}
		
		const goToPostDetail = (postId) => {
			uni.navigateTo({
				url: `/pages/post-detail/post-detail?id=${postId}`
			})
		}
		
		// 页面加载时获取数据
		onMounted(() => {
			loadData()
		})
		
		return {
			refreshing,
			recommendedUsers,
			hotTopics,
			hotPosts,
			formatTime,
			onRefresh,
			toggleFollow,
			goToSearch,
			goToMoreUsers,
			goToMoreTopics,
			goToUserProfile,
			goToTopicDetail,
			goToPostDetail
		}
	}
}
</script>

<style lang="scss" scoped>
.discover-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f5f5f5;
}

/* 搜索栏 */
.search-bar {
	background: #fff;
	padding: 20rpx 30rpx;
	border-bottom: 1px solid #e5e5e5;
	
	.search-input {
		height: 72rpx;
		background: #f8f9fa;
		border-radius: 36rpx;
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		
		.iconfont {
			font-size: 32rpx;
			color: #999;
			margin-right: 16rpx;
		}
		
		.search-placeholder {
			font-size: 28rpx;
			color: #999;
		}
	}
}

/* 发现内容 */
.discover-content {
	flex: 1;
}

/* 区块样式 */
.section {
	background: #fff;
	margin-bottom: 20rpx;
	padding: 30rpx;
	
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
		
		.section-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #333;
		}
		
		.section-more {
			font-size: 28rpx;
			color: #007aff;
		}
	}
}

/* 推荐用户 */
.users-scroll {
	.users-list {
		display: flex;
		gap: 30rpx;
		
		.user-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			min-width: 140rpx;
			
			.user-avatar {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				margin-bottom: 16rpx;
			}
			
			.user-name {
				font-size: 24rpx;
				color: #333;
				margin-bottom: 12rpx;
				text-align: center;
			}
			
			.follow-btn {
				width: 100rpx;
				height: 48rpx;
				background: #007aff;
				color: #fff;
				border: none;
				border-radius: 24rpx;
				font-size: 22rpx;
				
				&.following {
					background: #f0f0f0;
					color: #999;
				}
			}
		}
	}
}

/* 热门话题 */
.topics-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
	
	.topic-item {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16rpx;
		padding: 30rpx 20rpx;
		text-align: center;
		
		.topic-name {
			display: block;
			font-size: 28rpx;
			font-weight: 600;
			color: #fff;
			margin-bottom: 8rpx;
		}
		
		.topic-count {
			font-size: 22rpx;
			color: rgba(255, 255, 255, 0.8);
		}
	}
}

/* 热门动态 */
.posts-list {
	.post-item {
		border-bottom: 1px solid #f0f0f0;
		padding-bottom: 30rpx;
		margin-bottom: 30rpx;
		
		&:last-child {
			border-bottom: none;
			margin-bottom: 0;
			padding-bottom: 0;
		}
		
		.post-header {
			display: flex;
			align-items: center;
			margin-bottom: 16rpx;
			
			.user-avatar {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				margin-right: 16rpx;
			}
			
			.user-info {
				flex: 1;
				
				.username {
					display: block;
					font-size: 28rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 4rpx;
				}
				
				.post-time {
					font-size: 22rpx;
					color: #999;
				}
			}
			
			.post-stats {
				.stat-item {
					font-size: 24rpx;
					color: #ff3b30;
				}
			}
		}
		
		.post-content {
			font-size: 28rpx;
			color: #333;
			line-height: 1.5;
			margin-bottom: 16rpx;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
			overflow: hidden;
		}
		
		.post-images {
			display: flex;
			gap: 10rpx;
			
			.post-image {
				width: 160rpx;
				height: 160rpx;
				border-radius: 12rpx;
			}
		}
	}
}
</style>
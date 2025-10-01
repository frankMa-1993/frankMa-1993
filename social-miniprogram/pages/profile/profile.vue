<template>
	<view class="profile-container">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-bg">
				<image src="/static/default-bg.jpg" mode="aspectFill"></image>
			</view>
			<view class="user-info">
				<view class="avatar-section">
					<image 
						class="user-avatar" 
						:src="userInfo.avatar || '/static/default-avatar.png'" 
						mode="aspectFill"
						@click="changeAvatar"
					></image>
					<view class="avatar-edit" @click="changeAvatar">
						<text class="iconfont icon-camera"></text>
					</view>
				</view>
				<view class="user-details">
					<text class="username">{{ userInfo.nickname || userInfo.username }}</text>
					<text class="user-id">ID: {{ userInfo.id }}</text>
					<text class="user-bio" v-if="userInfo.bio">{{ userInfo.bio }}</text>
				</view>
				<view class="user-stats">
					<view class="stat-item" @click="goToFollowers">
						<text class="stat-number">{{ userInfo.followers }}</text>
						<text class="stat-label">粉丝</text>
					</view>
					<view class="stat-item" @click="goToFollowing">
						<text class="stat-number">{{ userInfo.following }}</text>
						<text class="stat-label">关注</text>
					</view>
					<view class="stat-item" @click="goToMyPosts">
						<text class="stat-number">{{ userInfo.posts }}</text>
						<text class="stat-label">动态</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-group">
				<view class="menu-item" @click="goToEditProfile">
					<view class="menu-icon">
						<text class="iconfont icon-edit"></text>
					</view>
					<text class="menu-text">编辑资料</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
				<view class="menu-item" @click="goToFriends">
					<view class="menu-icon">
						<text class="iconfont icon-friends"></text>
					</view>
					<text class="menu-text">我的好友</text>
					<view class="menu-badge" v-if="friendRequestsCount > 0">
						<text>{{ friendRequestsCount }}</text>
					</view>
					<text class="iconfont icon-arrow-right"></text>
				</view>
				<view class="menu-item" @click="goToMyPosts">
					<view class="menu-icon">
						<text class="iconfont icon-post"></text>
					</view>
					<text class="menu-text">我的动态</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
			
			<view class="menu-group">
				<view class="menu-item" @click="goToSettings">
					<view class="menu-icon">
						<text class="iconfont icon-settings"></text>
					</view>
					<text class="menu-text">设置</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
				<view class="menu-item" @click="goToPrivacy">
					<view class="menu-icon">
						<text class="iconfont icon-privacy"></text>
					</view>
					<text class="menu-text">隐私设置</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
				<view class="menu-item" @click="goToNotification">
					<view class="menu-icon">
						<text class="iconfont icon-bell"></text>
					</view>
					<text class="menu-text">通知设置</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
			
			<view class="menu-group">
				<view class="menu-item" @click="goToHelp">
					<view class="menu-icon">
						<text class="iconfont icon-help"></text>
					</view>
					<text class="menu-text">帮助与反馈</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
				<view class="menu-item" @click="goToAbout">
					<view class="menu-icon">
						<text class="iconfont icon-info"></text>
					</view>
					<text class="menu-text">关于我们</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
			
			<view class="menu-group">
				<view class="menu-item logout" @click="handleLogout">
					<view class="menu-icon">
						<text class="iconfont icon-logout"></text>
					</view>
					<text class="menu-text">退出登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'

export default {
	name: 'Profile',
	setup() {
		const userStore = useUserStore()
		
		// 响应式数据
		const friendRequestsCount = ref(3)
		
		// 计算属性
		const userInfo = computed(() => userStore.userInfo)
		
		// 更换头像
		const changeAvatar = () => {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					try {
						const result = await userStore.uploadAvatar(res.tempFilePaths[0])
						if (result.success) {
							uni.showToast({
								title: '头像更新成功',
								icon: 'success'
							})
						}
					} catch (error) {
						console.error('上传头像失败:', error)
						uni.showToast({
							title: '头像更新失败',
							icon: 'none'
						})
					}
				}
			})
		}
		
		// 页面跳转
		const goToEditProfile = () => {
			uni.navigateTo({
				url: '/pages/user-profile/user-profile'
			})
		}
		
		const goToFriends = () => {
			uni.navigateTo({
				url: '/pages/friends/friends'
			})
		}
		
		const goToMyPosts = () => {
			uni.showToast({
				title: '我的动态功能开发中',
				icon: 'none'
			})
		}
		
		const goToFollowers = () => {
			uni.showToast({
				title: '粉丝列表功能开发中',
				icon: 'none'
			})
		}
		
		const goToFollowing = () => {
			uni.showToast({
				title: '关注列表功能开发中',
				icon: 'none'
			})
		}
		
		const goToSettings = () => {
			uni.navigateTo({
				url: '/pages/settings/settings'
			})
		}
		
		const goToPrivacy = () => {
			uni.showToast({
				title: '隐私设置功能开发中',
				icon: 'none'
			})
		}
		
		const goToNotification = () => {
			uni.showToast({
				title: '通知设置功能开发中',
				icon: 'none'
			})
		}
		
		const goToHelp = () => {
			uni.showToast({
				title: '帮助与反馈功能开发中',
				icon: 'none'
			})
		}
		
		const goToAbout = () => {
			uni.showModal({
				title: '关于我们',
				content: '社交小程序 v1.0.0\n\n这是一个基于uniapp开发的社交类微信小程序，提供动态发布、好友互动、消息聊天等功能。',
				showCancel: false
			})
		}
		
		// 退出登录
		const handleLogout = () => {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						userStore.logout()
						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						})
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/login/login'
							})
						}, 1500)
					}
				}
			})
		}
		
		// 页面加载时检查登录状态
		onMounted(() => {
			if (!userStore.isLoggedIn) {
				uni.reLaunch({
					url: '/pages/login/login'
				})
			}
		})
		
		return {
			userInfo,
			friendRequestsCount,
			changeAvatar,
			goToEditProfile,
			goToFriends,
			goToMyPosts,
			goToFollowers,
			goToFollowing,
			goToSettings,
			goToPrivacy,
			goToNotification,
			goToHelp,
			goToAbout,
			handleLogout
		}
	}
}
</script>

<style lang="scss" scoped>
.profile-container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* 用户信息卡片 */
.user-card {
	position: relative;
	margin-bottom: 20rpx;
	
	.user-bg {
		width: 100%;
		height: 400rpx;
		
		image {
			width: 100%;
			height: 100%;
		}
	}
	
	.user-info {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
		padding: 60rpx 30rpx 30rpx;
		color: #fff;
		
		.avatar-section {
			position: relative;
			display: inline-block;
			margin-bottom: 20rpx;
			
			.user-avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				border: 4rpx solid rgba(255, 255, 255, 0.3);
			}
			
			.avatar-edit {
				position: absolute;
				bottom: 0;
				right: 0;
				width: 40rpx;
				height: 40rpx;
				background: #007aff;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.iconfont {
					font-size: 20rpx;
					color: #fff;
				}
			}
		}
		
		.user-details {
			margin-bottom: 30rpx;
			
			.username {
				display: block;
				font-size: 36rpx;
				font-weight: 600;
				margin-bottom: 8rpx;
			}
			
			.user-id {
				display: block;
				font-size: 24rpx;
				opacity: 0.8;
				margin-bottom: 12rpx;
			}
			
			.user-bio {
				display: block;
				font-size: 28rpx;
				opacity: 0.9;
			}
		}
		
		.user-stats {
			display: flex;
			
			.stat-item {
				flex: 1;
				text-align: center;
				
				.stat-number {
					display: block;
					font-size: 32rpx;
					font-weight: 600;
					margin-bottom: 4rpx;
				}
				
				.stat-label {
					font-size: 24rpx;
					opacity: 0.8;
				}
			}
		}
	}
}

/* 功能菜单 */
.menu-section {
	padding: 0 30rpx;
	
	.menu-group {
		background: #fff;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		
		.menu-item {
			display: flex;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1px solid #f0f0f0;
			position: relative;
			
			&:last-child {
				border-bottom: none;
			}
			
			&.logout {
				color: #ff3b30;
				
				.menu-icon .iconfont {
					color: #ff3b30;
				}
				
				.menu-text {
					color: #ff3b30;
				}
			}
			
			&:active {
				background: #f8f9fa;
			}
			
			.menu-icon {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 24rpx;
				
				.iconfont {
					font-size: 36rpx;
					color: #007aff;
				}
			}
			
			.menu-text {
				flex: 1;
				font-size: 32rpx;
				color: #333;
			}
			
			.menu-badge {
				background: #ff3b30;
				color: #fff;
				font-size: 20rpx;
				padding: 4rpx 12rpx;
				border-radius: 12rpx;
				margin-right: 16rpx;
				min-width: 32rpx;
				text-align: center;
			}
			
			.iconfont {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}
</style>
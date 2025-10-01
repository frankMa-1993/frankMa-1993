<template>
	<view class="friends-container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input">
				<text class="iconfont icon-search"></text>
				<input 
					class="input-field" 
					placeholder="搜索好友" 
					v-model="searchKeyword"
					@input="onSearchInput"
				/>
			</view>
		</view>
		
		<!-- 好友分类标签 -->
		<view class="friend-tabs">
			<view 
				class="tab-item" 
				v-for="(tab, index) in tabs" 
				:key="index"
				:class="{ 'active': currentTab === index }"
				@click="switchTab(index)"
			>
				<text class="tab-text">{{ tab.name }}</text>
				<view class="tab-badge" v-if="tab.count > 0">{{ tab.count }}</view>
			</view>
		</view>
		
		<!-- 好友列表 -->
		<scroll-view class="friends-list" scroll-y>
			<!-- 在线好友 -->
			<view class="section" v-if="currentTab === 0">
				<view class="section-header">
					<text class="section-title">在线好友</text>
					<text class="section-count">{{ onlineFriends.length }} 人</text>
				</view>
				<view class="friends-grid">
					<view 
						class="friend-item" 
						v-for="friend in onlineFriends" 
						:key="friend.id"
						@click="goToChat(friend)"
					>
						<view class="friend-avatar">
							<image :src="friend.avatar" mode="aspectFill"></image>
							<view class="online-status"></view>
						</view>
						<text class="friend-name">{{ friend.nickname }}</text>
					</view>
				</view>
			</view>
			
			<!-- 全部好友 -->
			<view class="section" v-if="currentTab === 1">
				<view class="friends-list-content">
					<view 
						class="friend-item" 
						v-for="friend in filteredFriends" 
						:key="friend.id"
						@click="goToChat(friend)"
					>
						<view class="friend-avatar">
							<image :src="friend.avatar" mode="aspectFill"></image>
							<view class="online-status" v-if="friend.isOnline"></view>
						</view>
						<view class="friend-info">
							<text class="friend-name">{{ friend.nickname }}</text>
							<text class="friend-signature" v-if="friend.signature">{{ friend.signature }}</text>
						</view>
						<view class="friend-actions">
							<view class="action-btn" @click.stop="showFriendMenu(friend)">
								<text class="iconfont icon-more"></text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 好友请求 -->
			<view class="section" v-if="currentTab === 2">
				<view class="requests-list">
					<view 
						class="request-item" 
						v-for="request in friendRequests" 
						:key="request.id"
					>
						<image class="request-avatar" :src="request.avatar" mode="aspectFill"></image>
						<view class="request-info">
							<text class="request-name">{{ request.nickname }}</text>
							<text class="request-message">{{ request.message }}</text>
						</view>
						<view class="request-actions">
							<button class="action-btn reject" @click="handleFriendRequest(request, 'reject')">
								拒绝
							</button>
							<button class="action-btn accept" @click="handleFriendRequest(request, 'accept')">
								同意
							</button>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 添加好友按钮 -->
		<view class="add-friend-btn" @click="showAddFriendOptions">
			<text class="iconfont icon-plus"></text>
		</view>
	</view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
	name: 'Friends',
	setup() {
		// 响应式数据
		const searchKeyword = ref('')
		const currentTab = ref(0)
		const friends = ref([])
		const onlineFriends = ref([])
		const friendRequests = ref([])
		
		const tabs = ref([
			{ name: '在线', count: 0 },
			{ name: '全部', count: 0 },
			{ name: '请求', count: 0 }
		])
		
		// 计算属性
		const filteredFriends = computed(() => {
			if (!searchKeyword.value.trim()) {
				return friends.value
			}
			return friends.value.filter(friend => 
				friend.nickname.toLowerCase().includes(searchKeyword.value.toLowerCase())
			)
		})
		
		// 获取好友列表
		const getFriends = () => {
			const mockFriends = []
			const names = ['小明', '小红', '小李', '小王', '小张', '小刘', '小陈', '小杨']
			const signatures = [
				'今天天气真好',
				'努力学习中',
				'享受生活',
				'工作使我快乐',
				'爱笑的女孩运气不会太差',
				'保持初心',
				'向前看',
				'加油！'
			]
			
			for (let i = 0; i < 8; i++) {
				mockFriends.push({
					id: (i + 1).toString(),
					nickname: names[i],
					avatar: '/static/default-avatar.png',
					isOnline: Math.random() > 0.5,
					signature: signatures[i]
				})
			}
			
			friends.value = mockFriends
			onlineFriends.value = mockFriends.filter(friend => friend.isOnline)
			
			// 更新标签计数
			tabs.value[0].count = onlineFriends.value.length
			tabs.value[1].count = friends.value.length
		}
		
		// 获取好友请求
		const getFriendRequests = () => {
			const mockRequests = [
				{
					id: '1',
					nickname: '新朋友1',
					avatar: '/static/default-avatar.png',
					message: '你好，想和你交个朋友'
				},
				{
					id: '2',
					nickname: '新朋友2',
					avatar: '/static/default-avatar.png',
					message: '通过朋友介绍认识你'
				}
			]
			
			friendRequests.value = mockRequests
			tabs.value[2].count = mockRequests.length
		}
		
		// 搜索输入
		const onSearchInput = () => {
			// 搜索逻辑已经在计算属性中处理
		}
		
		// 切换标签
		const switchTab = (index) => {
			currentTab.value = index
		}
		
		// 处理好友请求
		const handleFriendRequest = (request, action) => {
			if (action === 'accept') {
				// 添加到好友列表
				const newFriend = {
					id: request.id,
					nickname: request.nickname,
					avatar: request.avatar,
					isOnline: true,
					signature: ''
				}
				friends.value.unshift(newFriend)
				if (newFriend.isOnline) {
					onlineFriends.value.unshift(newFriend)
				}
				
				// 移除请求
				friendRequests.value = friendRequests.value.filter(req => req.id !== request.id)
				tabs.value[2].count = friendRequests.value.length
				tabs.value[1].count = friends.value.length
				
				uni.showToast({
					title: '已添加为好友',
					icon: 'success'
				})
			} else {
				// 拒绝请求
				friendRequests.value = friendRequests.value.filter(req => req.id !== request.id)
				tabs.value[2].count = friendRequests.value.length
				
				uni.showToast({
					title: '已拒绝请求',
					icon: 'none'
				})
			}
		}
		
		// 显示好友菜单
		const showFriendMenu = (friend) => {
			uni.showActionSheet({
				itemList: ['发送消息', '查看资料', '删除好友'],
				success: (res) => {
					const index = res.tapIndex
					switch (index) {
						case 0:
							goToChat(friend)
							break
						case 1:
							goToUserProfile(friend.id)
							break
						case 2:
							deleteFriend(friend)
							break
					}
				}
			})
		}
		
		// 删除好友
		const deleteFriend = (friend) => {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除好友 ${friend.nickname} 吗？`,
				success: (res) => {
					if (res.confirm) {
						friends.value = friends.value.filter(f => f.id !== friend.id)
						onlineFriends.value = onlineFriends.value.filter(f => f.id !== friend.id)
						tabs.value[1].count = friends.value.length
						tabs.value[0].count = onlineFriends.value.length
						
						uni.showToast({
							title: '已删除好友',
							icon: 'success'
						})
					}
				}
			})
		}
		
		// 显示添加好友选项
		const showAddFriendOptions = () => {
			uni.showActionSheet({
				itemList: ['搜索用户', '扫一扫', '从通讯录添加'],
				success: (res) => {
					const index = res.tapIndex
					switch (index) {
						case 0:
							searchUsers()
							break
						case 1:
							scanQRCode()
							break
						case 2:
							addFromContacts()
							break
					}
				}
			})
		}
		
		// 搜索用户
		const searchUsers = () => {
			uni.showToast({
				title: '搜索用户功能开发中',
				icon: 'none'
			})
		}
		
		// 扫一扫
		const scanQRCode = () => {
			uni.showToast({
				title: '扫一扫功能开发中',
				icon: 'none'
			})
		}
		
		// 从通讯录添加
		const addFromContacts = () => {
			uni.showToast({
				title: '从通讯录添加功能开发中',
				icon: 'none'
			})
		}
		
		// 页面跳转
		const goToChat = (friend) => {
			uni.navigateTo({
				url: `/pages/chat/chat?chatId=${friend.id}&chatName=${friend.nickname}`
			})
		}
		
		const goToUserProfile = (userId) => {
			uni.navigateTo({
				url: `/pages/user-profile/user-profile?userId=${userId}`
			})
		}
		
		// 页面加载时获取数据
		onMounted(() => {
			getFriends()
			getFriendRequests()
		})
		
		return {
			searchKeyword,
			currentTab,
			tabs,
			friends,
			onlineFriends,
			friendRequests,
			filteredFriends,
			onSearchInput,
			switchTab,
			handleFriendRequest,
			showFriendMenu,
			showAddFriendOptions,
			goToChat,
			goToUserProfile
		}
	}
}
</script>

<style lang="scss" scoped>
.friends-container {
	height: 100vh;
	background-color: #f5f5f5;
	position: relative;
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
		
		.input-field {
			flex: 1;
			font-size: 28rpx;
			color: #333;
		}
	}
}

/* 好友标签 */
.friend-tabs {
	background: #fff;
	display: flex;
	border-bottom: 1px solid #e5e5e5;
	
	.tab-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 30rpx 20rpx;
		position: relative;
		
		&.active {
			.tab-text {
				color: #007aff;
				font-weight: 600;
			}
			
			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 60rpx;
				height: 4rpx;
				background: #007aff;
				border-radius: 2rpx;
			}
		}
		
		.tab-text {
			font-size: 28rpx;
			color: #333;
			margin-right: 8rpx;
		}
		
		.tab-badge {
			background: #ff3b30;
			color: #fff;
			font-size: 20rpx;
			padding: 4rpx 8rpx;
			border-radius: 10rpx;
			min-width: 20rpx;
			text-align: center;
		}
	}
}

/* 好友列表 */
.friends-list {
	flex: 1;
	padding-bottom: 120rpx;
}

/* 区块 */
.section {
	background: #fff;
	margin-bottom: 20rpx;
	
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
		
		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}
		
		.section-count {
			font-size: 24rpx;
			color: #999;
		}
	}
}

/* 在线好友网格 */
.friends-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 30rpx;
	gap: 30rpx;
	
	.friend-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 140rpx;
		
		.friend-avatar {
			position: relative;
			width: 100rpx;
			height: 100rpx;
			margin-bottom: 16rpx;
			
			image {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}
			
			.online-status {
				position: absolute;
				bottom: 8rpx;
				right: 8rpx;
				width: 24rpx;
				height: 24rpx;
				background: #34c759;
				border: 4rpx solid #fff;
				border-radius: 50%;
			}
		}
		
		.friend-name {
			font-size: 24rpx;
			color: #333;
			text-align: center;
		}
	}
}

/* 好友列表 */
.friends-list-content {
	.friend-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
		
		&:last-child {
			border-bottom: none;
		}
		
		.friend-avatar {
			position: relative;
			width: 80rpx;
			height: 80rpx;
			margin-right: 24rpx;
			
			image {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}
			
			.online-status {
				position: absolute;
				bottom: 8rpx;
				right: 8rpx;
				width: 20rpx;
				height: 20rpx;
				background: #34c759;
				border: 3rpx solid #fff;
				border-radius: 50%;
			}
		}
		
		.friend-info {
			flex: 1;
			
			.friend-name {
				display: block;
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 8rpx;
			}
			
			.friend-signature {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.friend-actions {
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
}

/* 好友请求列表 */
.requests-list {
	.request-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
		
		&:last-child {
			border-bottom: none;
		}
		
		.request-avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 24rpx;
		}
		
		.request-info {
			flex: 1;
			
			.request-name {
				display: block;
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 8rpx;
			}
			
			.request-message {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.request-actions {
			display: flex;
			gap: 16rpx;
			
			.action-btn {
				width: 120rpx;
				height: 60rpx;
				border: none;
				border-radius: 30rpx;
				font-size: 24rpx;
				
				&.reject {
					background: #f0f0f0;
					color: #666;
				}
				
				&.accept {
					background: #007aff;
					color: #fff;
				}
			}
		}
	}
}

/* 添加好友按钮 */
.add-friend-btn {
	position: fixed;
	bottom: 120rpx;
	right: 30rpx;
	width: 120rpx;
	height: 120rpx;
	background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
	z-index: 100;
	
	.iconfont {
		font-size: 48rpx;
		color: #fff;
	}
}
</style>
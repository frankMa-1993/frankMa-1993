<template>
	<view class="message-container">
		<!-- 消息列表 -->
		<scroll-view class="message-list" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
			<!-- 系统通知 -->
			<view class="message-item system" @click="goToSystemNotifications">
				<view class="message-avatar">
					<image src="/static/icons/system.png" mode="aspectFit"></image>
				</view>
				<view class="message-content">
					<view class="message-header">
						<text class="message-title">系统通知</text>
						<text class="message-time">{{ formatTime(systemNotification.time) }}</text>
					</view>
					<text class="message-preview">{{ systemNotification.content }}</text>
				</view>
				<view class="message-badge" v-if="systemNotification.unread > 0">
					<text>{{ systemNotification.unread }}</text>
				</view>
			</view>
			
			<!-- 好友请求 -->
			<view class="message-item request" @click="goToFriendRequests">
				<view class="message-avatar">
					<image src="/static/icons/friend-request.png" mode="aspectFit"></image>
				</view>
				<view class="message-content">
					<view class="message-header">
						<text class="message-title">好友请求</text>
						<text class="message-time">{{ formatTime(friendRequest.time) }}</text>
					</view>
					<text class="message-preview">{{ friendRequest.content }}</text>
				</view>
				<view class="message-badge" v-if="friendRequest.unread > 0">
					<text>{{ friendRequest.unread }}</text>
				</view>
			</view>
			
			<!-- 聊天消息列表 -->
			<view 
				class="message-item chat" 
				v-for="chat in chatList" 
				:key="chat.id"
				@click="goToChat(chat)"
			>
				<view class="message-avatar">
					<image :src="chat.avatar" mode="aspectFill"></image>
					<view class="online-status" v-if="chat.isOnline"></view>
				</view>
				<view class="message-content">
					<view class="message-header">
						<text class="message-title">{{ chat.name }}</text>
						<text class="message-time">{{ formatTime(chat.lastMessageTime) }}</text>
					</view>
					<text class="message-preview">{{ chat.lastMessage }}</text>
				</view>
				<view class="message-badge" v-if="chat.unreadCount > 0">
					<text>{{ chat.unreadCount }}</text>
				</view>
				<view class="message-status">
					<text class="iconfont" :class="getMessageStatusIcon(chat.lastMessageStatus)"></text>
				</view>
			</view>
		</scroll-view>
		
		<!-- 新建聊天按钮 -->
		<view class="new-chat-btn" @click="showNewChatOptions">
			<text class="iconfont icon-plus"></text>
		</view>
		
		<!-- 新建聊天选项弹窗 -->
		<view class="new-chat-modal" v-if="showNewChatModal" @click="hideNewChatModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">新建聊天</text>
					<text class="modal-close" @click="hideNewChatModal">
						<text class="iconfont icon-close"></text>
					</text>
				</view>
				<view class="modal-options">
					<view class="modal-option" @click="createGroupChat">
						<text class="iconfont icon-group"></text>
						<text class="option-text">创建群聊</text>
					</view>
					<view class="modal-option" @click="searchUsers">
						<text class="iconfont icon-user"></text>
						<text class="option-text">添加好友</text>
					</view>
					<view class="modal-option" @click="scanQRCode">
						<text class="iconfont icon-qrcode"></text>
						<text class="option-text">扫一扫</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
	name: 'Message',
	setup() {
		// 响应式数据
		const refreshing = ref(false)
		const showNewChatModal = ref(false)
		const chatList = ref([])
		const systemNotification = ref({
			time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
			content: '您有新的系统消息',
			unread: 2
		})
		const friendRequest = ref({
			time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
			content: '小明 请求添加您为好友',
			unread: 1
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
		
		// 获取消息状态图标
		const getMessageStatusIcon = (status) => {
			const statusMap = {
				'sent': 'icon-check',
				'delivered': 'icon-check-double',
				'read': 'icon-check-double-fill'
			}
			return statusMap[status] || 'icon-check'
		}
		
		// 获取聊天列表
		const getChatList = () => {
			const mockChats = []
			const names = ['小明', '小红', '小李', '小王', '小张', '小刘', '小陈', '小杨']
			const messages = [
				'你好，最近怎么样？',
				'今天天气真不错',
				'明天一起吃饭吧',
				'好的，没问题',
				'谢谢你的帮助',
				'不客气',
				'再见',
				'晚安'
			]
			
			for (let i = 0; i < 6; i++) {
				mockChats.push({
					id: (i + 1).toString(),
					name: names[i],
					avatar: '/static/default-avatar.png',
					lastMessage: messages[i],
					lastMessageTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
					unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
					isOnline: Math.random() > 0.5,
					lastMessageStatus: ['sent', 'delivered', 'read'][Math.floor(Math.random() * 3)]
				})
			}
			
			chatList.value = mockChats
		}
		
		// 下拉刷新
		const onRefresh = () => {
			refreshing.value = true
			getChatList()
			setTimeout(() => {
				refreshing.value = false
			}, 1000)
		}
		
		// 显示新建聊天选项
		const showNewChatOptions = () => {
			showNewChatModal.value = true
		}
		
		// 隐藏新建聊天弹窗
		const hideNewChatModal = () => {
			showNewChatModal.value = false
		}
		
		// 创建群聊
		const createGroupChat = () => {
			hideNewChatModal()
			uni.showToast({
				title: '创建群聊功能开发中',
				icon: 'none'
			})
		}
		
		// 搜索用户
		const searchUsers = () => {
			hideNewChatModal()
			uni.showToast({
				title: '搜索用户功能开发中',
				icon: 'none'
			})
		}
		
		// 扫一扫
		const scanQRCode = () => {
			hideNewChatModal()
			uni.showToast({
				title: '扫一扫功能开发中',
				icon: 'none'
			})
		}
		
		// 页面跳转
		const goToSystemNotifications = () => {
			uni.showToast({
				title: '系统通知功能开发中',
				icon: 'none'
			})
		}
		
		const goToFriendRequests = () => {
			uni.showToast({
				title: '好友请求功能开发中',
				icon: 'none'
			})
		}
		
		const goToChat = (chat) => {
			uni.navigateTo({
				url: `/pages/chat/chat?chatId=${chat.id}&chatName=${chat.name}`
			})
		}
		
		// 页面加载时获取数据
		onMounted(() => {
			getChatList()
		})
		
		return {
			refreshing,
			showNewChatModal,
			chatList,
			systemNotification,
			friendRequest,
			formatTime,
			getMessageStatusIcon,
			onRefresh,
			showNewChatOptions,
			hideNewChatModal,
			createGroupChat,
			searchUsers,
			scanQRCode,
			goToSystemNotifications,
			goToFriendRequests,
			goToChat
		}
	}
}
</script>

<style lang="scss" scoped>
.message-container {
	height: 100vh;
	background-color: #f5f5f5;
	position: relative;
}

/* 消息列表 */
.message-list {
	height: 100vh;
	padding-bottom: 120rpx; /* 为新建聊天按钮留出空间 */
}

/* 消息项 */
.message-item {
	background: #fff;
	margin-bottom: 2rpx;
	padding: 30rpx;
	display: flex;
	align-items: center;
	position: relative;
	
	&.system {
		border-left: 8rpx solid #ff9500;
	}
	
	&.request {
		border-left: 8rpx solid #007aff;
	}
	
	&.chat {
		&:active {
			background: #f8f9fa;
		}
	}
	
	.message-avatar {
		position: relative;
		width: 100rpx;
		height: 100rpx;
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
			width: 24rpx;
			height: 24rpx;
			background: #34c759;
			border: 4rpx solid #fff;
			border-radius: 50%;
		}
	}
	
	.message-content {
		flex: 1;
		min-width: 0;
		
		.message-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 8rpx;
			
			.message-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
			
			.message-time {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.message-preview {
			font-size: 28rpx;
			color: #666;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			overflow: hidden;
		}
	}
	
	.message-badge {
		position: absolute;
		top: 20rpx;
		right: 30rpx;
		min-width: 36rpx;
		height: 36rpx;
		background: #ff3b30;
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		
		text {
			font-size: 20rpx;
			color: #fff;
			padding: 0 8rpx;
		}
	}
	
	.message-status {
		position: absolute;
		bottom: 20rpx;
		right: 30rpx;
		
		.iconfont {
			font-size: 24rpx;
			color: #999;
			
			&.icon-check-double-fill {
				color: #007aff;
			}
		}
	}
}

/* 新建聊天按钮 */
.new-chat-btn {
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

/* 新建聊天弹窗 */
.new-chat-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	display: flex;
	align-items: flex-end;
	
	.modal-content {
		width: 100%;
		background: #fff;
		border-radius: 32rpx 32rpx 0 0;
		padding: 40rpx 30rpx;
		
		.modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 40rpx;
			
			.modal-title {
				font-size: 36rpx;
				font-weight: 600;
				color: #333;
			}
			
			.modal-close {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.iconfont {
					font-size: 32rpx;
					color: #999;
				}
			}
		}
		
		.modal-options {
			display: flex;
			justify-content: space-around;
			
			.modal-option {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 20rpx;
				
				.iconfont {
					font-size: 48rpx;
					color: #007aff;
					margin-bottom: 12rpx;
				}
				
				.option-text {
					font-size: 28rpx;
					color: #333;
				}
			}
		}
	}
}
</style>
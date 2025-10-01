<template>
	<view class="chat-container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<view class="navbar-left" @click="goBack">
					<text class="iconfont icon-arrow-left"></text>
				</view>
				<view class="navbar-center">
					<image class="chat-avatar" :src="chatInfo.avatar" mode="aspectFill"></image>
					<view class="chat-info">
						<text class="chat-name">{{ chatInfo.name }}</text>
						<text class="chat-status" v-if="chatInfo.isOnline">在线</text>
					</view>
				</view>
				<view class="navbar-right">
					<view class="nav-icon" @click="showChatMenu">
						<text class="iconfont icon-more"></text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 消息列表 -->
		<scroll-view 
			class="message-list" 
			scroll-y 
			:scroll-top="scrollTop"
			:scroll-into-view="scrollIntoView"
			@scrolltoupper="loadMoreMessages"
		>
			<view class="messages-container">
				<!-- 加载更多提示 -->
				<view class="load-more" v-if="loadingMessages">
					<view class="loading-spinner"></view>
					<text class="loading-text">加载中...</text>
				</view>
				
				<!-- 消息项 -->
				<view 
					class="message-item" 
					v-for="message in messages" 
					:key="message.id"
					:class="{ 'self': message.isSelf }"
					:id="'message-' + message.id"
				>
					<!-- 时间分割线 -->
					<view class="time-divider" v-if="message.showTime">
						<text class="time-text">{{ formatMessageTime(message.createdAt) }}</text>
					</view>
					
					<!-- 消息内容 -->
					<view class="message-content">
						<!-- 对方消息 -->
						<template v-if="!message.isSelf">
							<image 
								class="message-avatar" 
								:src="message.avatar" 
								mode="aspectFill"
							></image>
							<view class="message-bubble">
								<text class="message-text">{{ message.content }}</text>
								<view class="message-status">
									<text class="message-time">{{ formatTime(message.createdAt) }}</text>
								</view>
							</view>
						</template>
						
						<!-- 自己的消息 -->
						<template v-else>
							<view class="message-bubble self">
								<text class="message-text">{{ message.content }}</text>
								<view class="message-status">
									<text class="message-time">{{ formatTime(message.createdAt) }}</text>
									<text class="iconfont" :class="getMessageStatusIcon(message.status)"></text>
								</view>
							</view>
							<image 
								class="message-avatar" 
								:src="message.avatar" 
								mode="aspectFill"
							></image>
						</template>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 输入框 -->
		<view class="input-bar">
			<view class="input-container">
				<view class="input-actions">
					<view class="action-btn" @click="showEmojiPicker">
						<text class="iconfont icon-emoji"></text>
					</view>
					<view class="action-btn" @click="showMoreOptions">
						<text class="iconfont icon-plus"></text>
					</view>
				</view>
				<input 
					class="message-input" 
					:placeholder="inputPlaceholder"
					v-model="messageText"
					:focus="inputFocus"
					@focus="onInputFocus"
					@blur="onInputBlur"
					@confirm="sendMessage"
				/>
				<button 
					class="send-btn" 
					:class="{ 'active': messageText.trim() }"
					:disabled="!messageText.trim()"
					@click="sendMessage"
				>
					发送
				</button>
			</view>
		</view>
		
		<!-- 表情选择器 -->
		<view class="emoji-picker" v-if="showEmoji">
			<view class="emoji-header">
				<text class="emoji-title">选择表情</text>
				<text class="emoji-close" @click="hideEmojiPicker">
					<text class="iconfont icon-close"></text>
				</text>
			</view>
			<view class="emoji-grid">
				<view 
					class="emoji-item" 
					v-for="emoji in emojis" 
					:key="emoji"
					@click="insertEmoji(emoji)"
				>
					<text>{{ emoji }}</text>
				</view>
			</view>
		</view>
		
		<!-- 更多选项弹窗 -->
		<view class="more-options-modal" v-if="showMoreModal" @click="hideMoreOptions">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">更多选项</text>
					<text class="modal-close" @click="hideMoreOptions">
						<text class="iconfont icon-close"></text>
					</text>
				</view>
				<view class="modal-options">
					<view class="modal-option" @click="chooseImage">
						<text class="iconfont icon-image"></text>
						<text class="option-text">图片</text>
					</view>
					<view class="modal-option" @click="chooseVideo">
						<text class="iconfont icon-video"></text>
						<text class="option-text">视频</text>
					</view>
					<view class="modal-option" @click="chooseFile">
						<text class="iconfont icon-file"></text>
						<text class="option-text">文件</text>
					</view>
					<view class="modal-option" @click="shareLocation">
						<text class="iconfont icon-location"></text>
						<text class="option-text">位置</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from '../../stores/user'

export default {
	name: 'Chat',
	setup() {
		const userStore = useUserStore()
		
		// 响应式数据
		const messages = ref([])
		const messageText = ref('')
		const inputFocus = ref(false)
		const showEmoji = ref(false)
		const showMoreModal = ref(false)
		const loadingMessages = ref(false)
		const scrollTop = ref(0)
		const scrollIntoView = ref('')
		const chatInfo = ref({
			id: '',
			name: '',
			avatar: '/static/default-avatar.png',
			isOnline: false
		})
		
		// 表情数据
		const emojis = ref([
			'😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
			'😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
			'😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
			'🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
			'😔', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢',
			'😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱'
		])
		
		// 计算属性
		const userInfo = computed(() => userStore.userInfo)
		const inputPlaceholder = computed(() => `给${chatInfo.value.name}发消息`)
		
		// 格式化时间
		const formatTime = (timeStr) => {
			const time = new Date(timeStr)
			return time.toLocaleTimeString('zh-CN', { 
				hour: '2-digit', 
				minute: '2-digit' 
			})
		}
		
		// 格式化消息时间（用于时间分割线）
		const formatMessageTime = (timeStr) => {
			const time = new Date(timeStr)
			const now = new Date()
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			const messageDate = new Date(time.getFullYear(), time.getMonth(), time.getDate())
			
			if (messageDate.getTime() === today.getTime()) {
				return '今天'
			} else if (messageDate.getTime() === today.getTime() - 86400000) {
				return '昨天'
			} else {
				return time.toLocaleDateString('zh-CN', { 
					month: 'short', 
					day: 'numeric' 
				})
			}
		}
		
		// 获取消息状态图标
		const getMessageStatusIcon = (status) => {
			const statusMap = {
				'sending': 'icon-loading',
				'sent': 'icon-check',
				'delivered': 'icon-check-double',
				'read': 'icon-check-double-fill'
			}
			return statusMap[status] || 'icon-check'
		}
		
		// 获取聊天信息
		const getChatInfo = () => {
			const pages = getCurrentPages()
			const currentPage = pages[pages.length - 1]
			const chatId = currentPage.options.chatId
			const chatName = currentPage.options.chatName
			
			chatInfo.value = {
				id: chatId,
				name: decodeURIComponent(chatName),
				avatar: '/static/default-avatar.png',
				isOnline: Math.random() > 0.5
			}
		}
		
		// 获取消息列表
		const getMessages = () => {
			const mockMessages = []
			const chatContents = [
				'你好！',
				'最近怎么样？',
				'还不错，你呢？',
				'我也很好，谢谢关心',
				'今天天气真不错',
				'是啊，很适合出去走走',
				'要不要一起出去？',
				'好啊，去哪里呢？',
				'去公园怎么样？',
				'好主意！'
			]
			
			for (let i = 0; i < 10; i++) {
				const isSelf = i % 2 === 1
				const time = new Date(Date.now() - (9 - i) * 5 * 60 * 1000)
				
				mockMessages.push({
					id: (i + 1).toString(),
					content: chatContents[i],
					avatar: isSelf ? userInfo.value.avatar : chatInfo.value.avatar,
					isSelf: isSelf,
					createdAt: time.toISOString(),
					status: isSelf ? ['sent', 'delivered', 'read'][Math.floor(Math.random() * 3)] : 'received',
					showTime: i === 0 || new Date(mockMessages[i - 1]?.createdAt || 0).toDateString() !== time.toDateString()
				})
			}
			
			messages.value = mockMessages
			scrollToBottom()
		}
		
		// 加载更多消息
		const loadMoreMessages = () => {
			if (loadingMessages.value) return
			
			loadingMessages.value = true
			// 模拟加载更多消息
			setTimeout(() => {
				loadingMessages.value = false
			}, 1000)
		}
		
		// 发送消息
		const sendMessage = () => {
			if (!messageText.value.trim()) return
			
			const newMessage = {
				id: Date.now().toString(),
				content: messageText.value.trim(),
				avatar: userInfo.value.avatar,
				isSelf: true,
				createdAt: new Date().toISOString(),
				status: 'sending',
				showTime: false
			}
			
			messages.value.push(newMessage)
			messageText.value = ''
			scrollToBottom()
			
			// 模拟发送成功
			setTimeout(() => {
				newMessage.status = 'sent'
			}, 1000)
			
			// 模拟对方回复
			setTimeout(() => {
				const replyMessage = {
					id: (Date.now() + 1).toString(),
					content: '收到！',
					avatar: chatInfo.value.avatar,
					isSelf: false,
					createdAt: new Date().toISOString(),
					status: 'received',
					showTime: false
				}
				messages.value.push(replyMessage)
				scrollToBottom()
			}, 2000)
		}
		
		// 滚动到底部
		const scrollToBottom = () => {
			nextTick(() => {
				if (messages.value.length > 0) {
					const lastMessage = messages.value[messages.value.length - 1]
					scrollIntoView.value = 'message-' + lastMessage.id
				}
			})
		}
		
		// 输入框焦点事件
		const onInputFocus = () => {
			inputFocus.value = true
			setTimeout(() => {
				scrollToBottom()
			}, 300)
		}
		
		const onInputBlur = () => {
			inputFocus.value = false
		}
		
		// 显示表情选择器
		const showEmojiPicker = () => {
			showEmoji.value = true
		}
		
		// 隐藏表情选择器
		const hideEmojiPicker = () => {
			showEmoji.value = false
		}
		
		// 插入表情
		const insertEmoji = (emoji) => {
			messageText.value += emoji
			hideEmojiPicker()
		}
		
		// 显示更多选项
		const showMoreOptions = () => {
			showMoreModal.value = true
		}
		
		// 隐藏更多选项
		const hideMoreOptions = () => {
			showMoreModal.value = false
		}
		
		// 选择图片
		const chooseImage = () => {
			hideMoreOptions()
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					// 发送图片消息
					uni.showToast({
						title: '图片发送功能开发中',
						icon: 'none'
					})
				}
			})
		}
		
		// 选择视频
		const chooseVideo = () => {
			hideMoreOptions()
			uni.chooseVideo({
				sourceType: ['album', 'camera'],
				maxDuration: 60,
				camera: 'back',
				success: (res) => {
					// 发送视频消息
					uni.showToast({
						title: '视频发送功能开发中',
						icon: 'none'
					})
				}
			})
		}
		
		// 选择文件
		const chooseFile = () => {
			hideMoreOptions()
			uni.showToast({
				title: '文件发送功能开发中',
				icon: 'none'
			})
		}
		
		// 分享位置
		const shareLocation = () => {
			hideMoreOptions()
			uni.chooseLocation({
				success: (res) => {
					// 发送位置消息
					uni.showToast({
						title: '位置分享功能开发中',
						icon: 'none'
					})
				}
			})
		}
		
		// 显示聊天菜单
		const showChatMenu = () => {
			uni.showActionSheet({
				itemList: ['查看资料', '清空聊天记录', '举报'],
				success: (res) => {
					const index = res.tapIndex
					switch (index) {
						case 0:
							goToUserProfile()
							break
						case 1:
							clearChatHistory()
							break
						case 2:
							reportUser()
							break
					}
				}
			})
		}
		
		// 清空聊天记录
		const clearChatHistory = () => {
			uni.showModal({
				title: '确认清空',
				content: '确定要清空聊天记录吗？',
				success: (res) => {
					if (res.confirm) {
						messages.value = []
						uni.showToast({
							title: '已清空聊天记录',
							icon: 'success'
						})
					}
				}
			})
		}
		
		// 举报用户
		const reportUser = () => {
			uni.showToast({
				title: '举报功能开发中',
				icon: 'none'
			})
		}
		
		// 页面跳转
		const goBack = () => {
			uni.navigateBack()
		}
		
		const goToUserProfile = () => {
			uni.navigateTo({
				url: `/pages/user-profile/user-profile?userId=${chatInfo.value.id}`
			})
		}
		
		// 页面加载时获取数据
		onMounted(() => {
			getChatInfo()
			getMessages()
		})
		
		return {
			messages,
			messageText,
			inputFocus,
			showEmoji,
			showMoreModal,
			loadingMessages,
			scrollTop,
			scrollIntoView,
			chatInfo,
			emojis,
			userInfo,
			inputPlaceholder,
			formatTime,
			formatMessageTime,
			getMessageStatusIcon,
			loadMoreMessages,
			sendMessage,
			onInputFocus,
			onInputBlur,
			showEmojiPicker,
			hideEmojiPicker,
			insertEmoji,
			showMoreOptions,
			hideMoreOptions,
			chooseImage,
			chooseVideo,
			chooseFile,
			shareLocation,
			showChatMenu,
			goBack,
			goToUserProfile
		}
	}
}
</script>

<style lang="scss" scoped>
.chat-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f5f5f5;
}

/* 自定义导航栏 */
.custom-navbar {
	background: #fff;
	padding-top: 44rpx;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	border-bottom: 1px solid #e5e5e5;
	
	.navbar-content {
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		
		.navbar-left {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.iconfont {
				font-size: 36rpx;
				color: #007aff;
			}
		}
		
		.navbar-center {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.chat-avatar {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				margin-right: 16rpx;
			}
			
			.chat-info {
				text-align: left;
				
				.chat-name {
					display: block;
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 4rpx;
				}
				
				.chat-status {
					font-size: 20rpx;
					color: #34c759;
				}
			}
		}
		
		.navbar-right {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.nav-icon {
				.iconfont {
					font-size: 36rpx;
					color: #007aff;
				}
			}
		}
	}
}

/* 消息列表 */
.message-list {
	flex: 1;
	padding-top: 132rpx;
	padding-bottom: 120rpx;
}

.messages-container {
	padding: 20rpx 30rpx;
	
	.load-more {
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
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
}

/* 消息项 */
.message-item {
	margin-bottom: 30rpx;
	
	&.self {
		.message-content {
			flex-direction: row-reverse;
		}
	}
	
	.time-divider {
		text-align: center;
		margin: 40rpx 0;
		
		.time-text {
			background: rgba(0, 0, 0, 0.1);
			color: #999;
			font-size: 20rpx;
			padding: 8rpx 16rpx;
			border-radius: 12rpx;
		}
	}
	
	.message-content {
		display: flex;
		align-items: flex-end;
		
		.message-avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin: 0 16rpx;
		}
		
		.message-bubble {
			max-width: 70%;
			background: #fff;
			border-radius: 16rpx;
			padding: 20rpx 24rpx;
			position: relative;
			
			&.self {
				background: #007aff;
				
				.message-text {
					color: #fff;
				}
				
				.message-time {
					color: rgba(255, 255, 255, 0.8);
				}
				
				.iconfont {
					color: rgba(255, 255, 255, 0.8);
				}
			}
			
			.message-text {
				font-size: 32rpx;
				color: #333;
				line-height: 1.4;
				word-break: break-all;
			}
			
			.message-status {
				display: flex;
				align-items: center;
				justify-content: flex-end;
				margin-top: 8rpx;
				
				.message-time {
					font-size: 20rpx;
					color: #999;
					margin-right: 8rpx;
				}
				
				.iconfont {
					font-size: 20rpx;
					color: #999;
					
					&.icon-loading {
						animation: spin 1s linear infinite;
					}
				}
			}
		}
	}
}

/* 输入框 */
.input-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	border-top: 1px solid #e5e5e5;
	z-index: 100;
	
	.input-container {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		
		.input-actions {
			display: flex;
			margin-right: 16rpx;
			
			.action-btn {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 16rpx;
				
				.iconfont {
					font-size: 36rpx;
					color: #007aff;
				}
			}
		}
		
		.message-input {
			flex: 1;
			height: 72rpx;
			background: #f8f9fa;
			border-radius: 36rpx;
			padding: 0 24rpx;
			font-size: 28rpx;
			color: #333;
			margin-right: 16rpx;
		}
		
		.send-btn {
			width: 120rpx;
			height: 72rpx;
			background: #f0f0f0;
			color: #999;
			border: none;
			border-radius: 36rpx;
			font-size: 28rpx;
			
			&.active {
				background: #007aff;
				color: #fff;
			}
			
			&:disabled {
				opacity: 0.6;
			}
		}
	}
}

/* 表情选择器 */
.emoji-picker {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	border-top: 1px solid #e5e5e5;
	z-index: 200;
	
	.emoji-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
		border-bottom: 1px solid #f0f0f0;
		
		.emoji-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}
		
		.emoji-close {
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
	
	.emoji-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx;
		max-height: 400rpx;
		overflow-y: auto;
		
		.emoji-item {
			width: 80rpx;
			height: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			
			&:active {
				background: #f0f0f0;
				border-radius: 8rpx;
			}
		}
	}
}

/* 更多选项弹窗 */
.more-options-modal {
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
<template>
	<view class="publish-container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<view class="navbar-left" @click="goBack">
					<text class="iconfont icon-arrow-left"></text>
					<text class="nav-text">取消</text>
				</view>
				<view class="navbar-center">
					<text class="nav-title">发布动态</text>
				</view>
				<view class="navbar-right">
					<button 
						class="publish-btn" 
						:class="{ 'active': canPublish }"
						:disabled="!canPublish || publishing"
						@click="handlePublish"
					>
						{{ publishing ? '发布中...' : '发布' }}
					</button>
				</view>
			</view>
		</view>
		
		<!-- 发布表单 -->
		<view class="publish-form">
			<!-- 用户信息 -->
			<view class="user-section">
				<image 
					class="user-avatar" 
					:src="userInfo.avatar || '/static/default-avatar.png'" 
					mode="aspectFill"
				></image>
				<view class="user-info">
					<text class="username">{{ userInfo.nickname || userInfo.username }}</text>
					<view class="privacy-setting" @click="showPrivacyOptions">
						<text class="privacy-text">{{ privacyText }}</text>
						<text class="iconfont icon-arrow-right"></text>
					</view>
				</view>
			</view>
			
			<!-- 内容输入 -->
			<view class="content-section">
				<textarea 
					class="content-input" 
					placeholder="分享你的想法..." 
					v-model="publishForm.content"
					:maxlength="500"
					:show-confirm-bar="false"
					:auto-height="true"
				></textarea>
				<view class="char-count">{{ publishForm.content.length }}/500</view>
			</view>
			
			<!-- 媒体内容 -->
			<view class="media-section">
				<view class="media-list">
					<view 
						class="media-item" 
						v-for="(item, index) in publishForm.media" 
						:key="index"
					>
						<image 
							v-if="item.type === 'image'" 
							class="media-image" 
							:src="item.url" 
							mode="aspectFill"
						></image>
						<video 
							v-if="item.type === 'video'" 
							class="media-video" 
							:src="item.url" 
							controls
						></video>
						<view class="media-delete" @click="removeMedia(index)">
							<text class="iconfont icon-close"></text>
						</view>
					</view>
					
					<!-- 添加媒体按钮 -->
					<view 
						class="add-media-btn" 
						v-if="publishForm.media.length < 9"
						@click="showMediaOptions"
					>
						<text class="iconfont icon-plus"></text>
						<text class="add-text">添加</text>
					</view>
				</view>
			</view>
			
			<!-- 位置信息 -->
			<view class="location-section" @click="selectLocation">
				<view class="location-content">
					<text class="iconfont icon-location"></text>
					<text class="location-text">
						{{ publishForm.location || '添加位置信息' }}
					</text>
				</view>
				<text class="iconfont icon-arrow-right" v-if="!publishForm.location"></text>
			</view>
			
			<!-- 话题标签 -->
			<view class="topic-section" @click="showTopicSelector">
				<view class="topic-content">
					<text class="iconfont icon-tag"></text>
					<text class="topic-text">
						{{ publishForm.topics.length > 0 ? '已选择话题' : '添加话题' }}
					</text>
					<view class="topic-tags" v-if="publishForm.topics.length > 0">
						<text 
							class="topic-tag" 
							v-for="topic in publishForm.topics" 
							:key="topic"
						>#{{ topic }}</text>
					</view>
				</view>
				<text class="iconfont icon-arrow-right"></text>
			</view>
			
			<!-- 发布选项 -->
			<view class="publish-options">
				<view class="option-item" @click="toggleOption('allowComment')">
					<text class="option-text">允许评论</text>
					<switch 
						:checked="publishForm.allowComment" 
						@change="toggleOption('allowComment')"
					/>
				</view>
				<view class="option-item" @click="toggleOption('allowLike')">
					<text class="option-text">允许点赞</text>
					<switch 
						:checked="publishForm.allowLike" 
						@change="toggleOption('allowLike')"
					/>
				</view>
			</view>
		</view>
		
		<!-- 媒体选择弹窗 -->
		<view class="media-modal" v-if="showMediaModal" @click="hideMediaModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">选择媒体</text>
					<text class="modal-close" @click="hideMediaModal">
						<text class="iconfont icon-close"></text>
					</text>
				</view>
				<view class="modal-options">
					<view class="modal-option" @click="chooseImage">
						<text class="iconfont icon-camera"></text>
						<text class="option-text">拍照</text>
					</view>
					<view class="modal-option" @click="chooseImageFromAlbum">
						<text class="iconfont icon-image"></text>
						<text class="option-text">相册</text>
					</view>
					<view class="modal-option" @click="chooseVideo">
						<text class="iconfont icon-video"></text>
						<text class="option-text">视频</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 隐私设置弹窗 -->
		<view class="privacy-modal" v-if="showPrivacyModal" @click="hidePrivacyModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">隐私设置</text>
					<text class="modal-close" @click="hidePrivacyModal">
						<text class="iconfont icon-close"></text>
					</text>
				</view>
				<view class="modal-options">
					<view 
						class="modal-option" 
						:class="{ 'active': publishForm.privacy === 'public' }"
						@click="setPrivacy('public')"
					>
						<text class="option-text">公开</text>
						<text class="iconfont icon-check" v-if="publishForm.privacy === 'public'"></text>
					</view>
					<view 
						class="modal-option" 
						:class="{ 'active': publishForm.privacy === 'friends' }"
						@click="setPrivacy('friends')"
					>
						<text class="option-text">仅好友可见</text>
						<text class="iconfont icon-check" v-if="publishForm.privacy === 'friends'"></text>
					</view>
					<view 
						class="modal-option" 
						:class="{ 'active': publishForm.privacy === 'private' }"
						@click="setPrivacy('private')"
					>
						<text class="option-text">仅自己可见</text>
						<text class="iconfont icon-check" v-if="publishForm.privacy === 'private'"></text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { usePostStore } from '../../stores/post'

export default {
	name: 'Publish',
	setup() {
		const userStore = useUserStore()
		const postStore = usePostStore()
		
		// 响应式数据
		const publishing = ref(false)
		const showMediaModal = ref(false)
		const showPrivacyModal = ref(false)
		
		const publishForm = ref({
			content: '',
			media: [],
			location: '',
			topics: [],
			privacy: 'public',
			allowComment: true,
			allowLike: true
		})
		
		// 计算属性
		const userInfo = computed(() => userStore.userInfo)
		
		const canPublish = computed(() => {
			return publishForm.value.content.trim() || publishForm.value.media.length > 0
		})
		
		const privacyText = computed(() => {
			const privacyMap = {
				'public': '公开',
				'friends': '仅好友可见',
				'private': '仅自己可见'
			}
			return privacyMap[publishForm.value.privacy] || '公开'
		})
		
		// 返回上一页
		const goBack = () => {
			if (canPublish.value) {
				uni.showModal({
					title: '确认退出',
					content: '内容尚未保存，确定要退出吗？',
					success: (res) => {
						if (res.confirm) {
							uni.navigateBack()
						}
					}
				})
			} else {
				uni.navigateBack()
			}
		}
		
		// 处理发布
		const handlePublish = async () => {
			if (!canPublish.value || publishing.value) return
			
			publishing.value = true
			
			try {
				const postData = {
					userId: userInfo.value.id,
					username: userInfo.value.nickname || userInfo.value.username,
					userAvatar: userInfo.value.avatar,
					content: publishForm.value.content.trim(),
					images: publishForm.value.media.filter(item => item.type === 'image').map(item => item.url),
					video: publishForm.value.media.find(item => item.type === 'video')?.url || '',
					location: publishForm.value.location,
					topics: publishForm.value.topics,
					privacy: publishForm.value.privacy,
					allowComment: publishForm.value.allowComment,
					allowLike: publishForm.value.allowLike
				}
				
				const result = await postStore.publishPost(postData)
				
				if (result.success) {
					uni.showToast({
						title: '发布成功',
						icon: 'success'
					})
					
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					uni.showToast({
						title: result.message || '发布失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('发布错误:', error)
				uni.showToast({
					title: '发布失败，请重试',
					icon: 'none'
				})
			} finally {
				publishing.value = false
			}
		}
		
		// 显示媒体选择选项
		const showMediaOptions = () => {
			showMediaModal.value = true
		}
		
		// 隐藏媒体选择弹窗
		const hideMediaModal = () => {
			showMediaModal.value = false
		}
		
		// 选择图片（拍照）
		const chooseImage = () => {
			hideMediaModal()
			uni.chooseImage({
				count: 9 - publishForm.value.media.length,
				sizeType: ['compressed'],
				sourceType: ['camera'],
				success: (res) => {
					const newMedia = res.tempFilePaths.map(url => ({
						type: 'image',
						url: url
					}))
					publishForm.value.media.push(...newMedia)
				}
			})
		}
		
		// 选择图片（相册）
		const chooseImageFromAlbum = () => {
			hideMediaModal()
			uni.chooseImage({
				count: 9 - publishForm.value.media.length,
				sizeType: ['compressed'],
				sourceType: ['album'],
				success: (res) => {
					const newMedia = res.tempFilePaths.map(url => ({
						type: 'image',
						url: url
					}))
					publishForm.value.media.push(...newMedia)
				}
			})
		}
		
		// 选择视频
		const chooseVideo = () => {
			hideMediaModal()
			uni.chooseVideo({
				sourceType: ['album', 'camera'],
				maxDuration: 60,
				camera: 'back',
				success: (res) => {
					// 清空其他媒体，视频只能单独发布
					publishForm.value.media = [{
						type: 'video',
						url: res.tempFilePath
					}]
				}
			})
		}
		
		// 移除媒体
		const removeMedia = (index) => {
			publishForm.value.media.splice(index, 1)
		}
		
		// 选择位置
		const selectLocation = () => {
			uni.chooseLocation({
				success: (res) => {
					publishForm.value.location = res.name
				},
				fail: () => {
					uni.showToast({
						title: '获取位置失败',
						icon: 'none'
					})
				}
			})
		}
		
		// 显示话题选择器
		const showTopicSelector = () => {
			uni.showToast({
				title: '话题功能开发中',
				icon: 'none'
			})
		}
		
		// 显示隐私选项
		const showPrivacyOptions = () => {
			showPrivacyModal.value = true
		}
		
		// 隐藏隐私弹窗
		const hidePrivacyModal = () => {
			showPrivacyModal.value = false
		}
		
		// 设置隐私级别
		const setPrivacy = (privacy) => {
			publishForm.value.privacy = privacy
			hidePrivacyModal()
		}
		
		// 切换选项
		const toggleOption = (option) => {
			publishForm.value[option] = !publishForm.value[option]
		}
		
		return {
			publishing,
			showMediaModal,
			showPrivacyModal,
			publishForm,
			userInfo,
			canPublish,
			privacyText,
			goBack,
			handlePublish,
			showMediaOptions,
			hideMediaModal,
			chooseImage,
			chooseImageFromAlbum,
			chooseVideo,
			removeMedia,
			selectLocation,
			showTopicSelector,
			showPrivacyOptions,
			hidePrivacyModal,
			setPrivacy,
			toggleOption
		}
	}
}
</script>

<style lang="scss" scoped>
.publish-container {
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
			display: flex;
			align-items: center;
			
			.iconfont {
				font-size: 36rpx;
				color: #007aff;
				margin-right: 8rpx;
			}
			
			.nav-text {
				font-size: 32rpx;
				color: #007aff;
			}
		}
		
		.navbar-center {
			.nav-title {
				font-size: 36rpx;
				font-weight: 600;
				color: #333;
			}
		}
		
		.navbar-right {
			.publish-btn {
				padding: 16rpx 32rpx;
				background: #f0f0f0;
				color: #999;
				border: none;
				border-radius: 20rpx;
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
}

/* 发布表单 */
.publish-form {
	flex: 1;
	padding-top: 132rpx;
	padding-bottom: 40rpx;
	overflow-y: auto;
}

/* 用户信息区域 */
.user-section {
	background: #fff;
	padding: 30rpx;
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	
	.user-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}
	
	.user-info {
		flex: 1;
		
		.username {
			display: block;
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 8rpx;
		}
		
		.privacy-setting {
			display: flex;
			align-items: center;
			
			.privacy-text {
				font-size: 24rpx;
				color: #007aff;
				margin-right: 8rpx;
			}
			
			.iconfont {
				font-size: 20rpx;
				color: #007aff;
			}
		}
	}
}

/* 内容输入区域 */
.content-section {
	background: #fff;
	padding: 30rpx;
	margin-bottom: 20rpx;
	position: relative;
	
	.content-input {
		width: 100%;
		min-height: 200rpx;
		font-size: 32rpx;
		color: #333;
		line-height: 1.6;
		border: none;
		outline: none;
	}
	
	.char-count {
		position: absolute;
		bottom: 20rpx;
		right: 30rpx;
		font-size: 24rpx;
		color: #999;
	}
}

/* 媒体区域 */
.media-section {
	background: #fff;
	padding: 30rpx;
	margin-bottom: 20rpx;
	
	.media-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		
		.media-item {
			position: relative;
			width: 200rpx;
			height: 200rpx;
			border-radius: 12rpx;
			overflow: hidden;
			
			.media-image, .media-video {
				width: 100%;
				height: 100%;
			}
			
			.media-delete {
				position: absolute;
				top: 10rpx;
				right: 10rpx;
				width: 40rpx;
				height: 40rpx;
				background: rgba(0, 0, 0, 0.6);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.iconfont {
					font-size: 24rpx;
					color: #fff;
				}
			}
		}
		
		.add-media-btn {
			width: 200rpx;
			height: 200rpx;
			border: 2rpx dashed #ddd;
			border-radius: 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			
			.iconfont {
				font-size: 48rpx;
				color: #999;
				margin-bottom: 8rpx;
			}
			
			.add-text {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}

/* 位置信息区域 */
.location-section {
	background: #fff;
	padding: 30rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	
	.location-content {
		display: flex;
		align-items: center;
		flex: 1;
		
		.iconfont {
			font-size: 32rpx;
			color: #007aff;
			margin-right: 12rpx;
		}
		
		.location-text {
			font-size: 28rpx;
			color: #333;
		}
	}
	
	.iconfont {
		font-size: 24rpx;
		color: #999;
	}
}

/* 话题区域 */
.topic-section {
	background: #fff;
	padding: 30rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	
	.topic-content {
		flex: 1;
		
		.iconfont {
			font-size: 32rpx;
			color: #007aff;
			margin-right: 12rpx;
		}
		
		.topic-text {
			font-size: 28rpx;
			color: #333;
		}
		
		.topic-tags {
			margin-top: 12rpx;
			
			.topic-tag {
				display: inline-block;
				background: #f0f8ff;
				color: #007aff;
				padding: 8rpx 16rpx;
				border-radius: 16rpx;
				font-size: 24rpx;
				margin-right: 12rpx;
				margin-bottom: 8rpx;
			}
		}
	}
	
	.iconfont {
		font-size: 24rpx;
		color: #999;
	}
}

/* 发布选项 */
.publish-options {
	background: #fff;
	padding: 30rpx;
	
	.option-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
		
		&:last-child {
			border-bottom: none;
		}
		
		.option-text {
			font-size: 28rpx;
			color: #333;
		}
	}
}

/* 弹窗样式 */
.media-modal, .privacy-modal {
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
				
				&.active {
					background: #f0f8ff;
					border-radius: 16rpx;
				}
				
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
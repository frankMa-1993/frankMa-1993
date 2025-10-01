<template>
	<view id="app">
		<!-- 全局导航栏 -->
		<view class="global-nav" v-if="showGlobalNav">
			<view class="nav-content">
				<text class="nav-title">{{ navTitle }}</text>
			</view>
		</view>
		
		<!-- 页面内容 -->
		<view class="page-content" :class="{ 'with-nav': showGlobalNav }">
			<router-view />
		</view>
		
		<!-- 全局加载提示 -->
		<view class="loading-mask" v-if="globalLoading">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
		</view>
		
		<!-- 全局提示消息 -->
		<view class="toast-message" v-if="toastMessage" :class="{ 'show': toastShow }">
			<text>{{ toastMessage }}</text>
		</view>
	</view>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from './stores/user'

export default {
	name: 'App',
	setup() {
		const userStore = useUserStore()
		
		const globalLoading = ref(false)
		const toastMessage = ref('')
		const toastShow = ref(false)
		const navTitle = ref('社交小程序')
		const showGlobalNav = ref(false)
		
		// 显示全局加载
		const showLoading = () => {
			globalLoading.value = true
		}
		
		// 隐藏全局加载
		const hideLoading = () => {
			globalLoading.value = false
		}
		
		// 显示提示消息
		const showToast = (message, duration = 2000) => {
			toastMessage.value = message
			toastShow.value = true
			setTimeout(() => {
				toastShow.value = false
				setTimeout(() => {
					toastMessage.value = ''
				}, 300)
			}, duration)
		}
		
		// 初始化应用
		const initApp = async () => {
			showLoading()
			try {
				// 检查登录状态
				await userStore.checkLoginStatus()
			} catch (error) {
				console.error('初始化失败:', error)
			} finally {
				hideLoading()
			}
		}
		
		// 应用启动时初始化
		initApp()
		
		// 将方法挂载到全局
		uni.showLoading = showLoading
		uni.hideLoading = hideLoading
		uni.showToast = showToast
		
		return {
			globalLoading,
			toastMessage,
			toastShow,
			navTitle,
			showGlobalNav
		}
	},
	
	onLaunch() {
		console.log('App Launch')
	},
	
	onShow() {
		console.log('App Show')
	},
	
	onHide() {
		console.log('App Hide')
	}
}
</script>

<style lang="scss">
/* 全局样式重置 */
* {
	box-sizing: border-box;
}

page {
	background-color: #f5f5f5;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
	height: 100vh;
	display: flex;
	flex-direction: column;
}

/* 全局导航栏 */
.global-nav {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 999;
	background-color: #fff;
	border-bottom: 1px solid #e5e5e5;
	height: 88rpx;
	padding-top: 44rpx;
	
	.nav-content {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.nav-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #333;
		}
	}
}

/* 页面内容 */
.page-content {
	flex: 1;
	overflow: hidden;
	
	&.with-nav {
		padding-top: 88rpx;
	}
}

/* 全局加载样式 */
.loading-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	background-color: rgba(0, 0, 0, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	
	.loading-content {
		background-color: rgba(0, 0, 0, 0.8);
		border-radius: 20rpx;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.loading-spinner {
			width: 60rpx;
			height: 60rpx;
			border: 6rpx solid #fff;
			border-top: 6rpx solid transparent;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin-bottom: 20rpx;
		}
		
		.loading-text {
			color: #fff;
			font-size: 28rpx;
		}
	}
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

/* 全局提示消息 */
.toast-message {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%) scale(0.8);
	z-index: 9999;
	background-color: rgba(0, 0, 0, 0.8);
	color: #fff;
	padding: 24rpx 40rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	opacity: 0;
	transition: all 0.3s ease;
	
	&.show {
		transform: translate(-50%, -50%) scale(1);
		opacity: 1;
	}
}

/* 通用样式类 */
.container {
	padding: 0 30rpx;
}

.card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.btn {
	padding: 24rpx 48rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	text-align: center;
	border: none;
	cursor: pointer;
	transition: all 0.3s ease;
	
	&.primary {
		background-color: #007aff;
		color: #fff;
		
		&:active {
			background-color: #0056cc;
		}
	}
	
	&.secondary {
		background-color: #f0f0f0;
		color: #333;
		
		&:active {
			background-color: #e0e0e0;
		}
	}
	
	&.success {
		background-color: #34c759;
		color: #fff;
		
		&:active {
			background-color: #28a745;
		}
	}
	
	&.danger {
		background-color: #ff3b30;
		color: #fff;
		
		&:active {
			background-color: #d70015;
		}
	}
}

.text-center {
	text-align: center;
}

.text-left {
	text-align: left;
}

.text-right {
	text-align: right;
}

.flex {
	display: flex;
}

.flex-center {
	display: flex;
	align-items: center;
	justify-content: center;
}

.flex-between {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.flex-column {
	display: flex;
	flex-direction: column;
}

.mt-10 { margin-top: 10rpx; }
.mt-20 { margin-top: 20rpx; }
.mt-30 { margin-top: 30rpx; }
.mb-10 { margin-bottom: 10rpx; }
.mb-20 { margin-bottom: 20rpx; }
.mb-30 { margin-bottom: 30rpx; }
.ml-10 { margin-left: 10rpx; }
.ml-20 { margin-left: 20rpx; }
.mr-10 { margin-right: 10rpx; }
.mr-20 { margin-right: 20rpx; }

.p-10 { padding: 10rpx; }
.p-20 { padding: 20rpx; }
.p-30 { padding: 30rpx; }
</style>
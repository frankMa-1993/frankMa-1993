<template>
	<view class="login-container">
		<!-- 背景装饰 -->
		<view class="bg-decoration">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>
		
		<!-- 登录表单 -->
		<view class="login-form">
			<!-- Logo和标题 -->
			<view class="logo-section">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<text class="app-title">社交小程序</text>
				<text class="app-subtitle">连接你我，分享生活</text>
			</view>
			
			<!-- 登录表单 -->
			<view class="form-content">
				<view class="input-group">
					<view class="input-item">
						<view class="input-icon">
							<text class="iconfont icon-user"></text>
						</view>
						<input 
							class="input-field" 
							type="text" 
							placeholder="请输入用户名" 
							v-model="loginForm.username"
							:disabled="loading"
						/>
					</view>
					
					<view class="input-item">
						<view class="input-icon">
							<text class="iconfont icon-lock"></text>
						</view>
						<input 
							class="input-field" 
							:type="showPassword ? 'text' : 'password'" 
							placeholder="请输入密码" 
							v-model="loginForm.password"
							:disabled="loading"
						/>
						<view class="password-toggle" @click="togglePassword">
							<text class="iconfont" :class="showPassword ? 'icon-eye-open' : 'icon-eye-close'"></text>
						</view>
					</view>
				</view>
				
				<!-- 记住密码和忘记密码 -->
				<view class="form-options">
					<view class="remember-me" @click="toggleRemember">
						<view class="checkbox" :class="{ 'checked': rememberMe }">
							<text class="iconfont icon-check" v-if="rememberMe"></text>
						</view>
						<text class="option-text">记住密码</text>
					</view>
					<text class="forgot-password" @click="goToForgotPassword">忘记密码？</text>
				</view>
				
				<!-- 登录按钮 -->
				<button 
					class="login-btn" 
					:class="{ 'loading': loading }"
					:disabled="loading || !canLogin"
					@click="handleLogin"
				>
					<view class="btn-content">
						<view class="loading-spinner" v-if="loading"></view>
						<text>{{ loading ? '登录中...' : '登录' }}</text>
					</view>
				</button>
				
				<!-- 其他登录方式 -->
				<view class="other-login">
					<view class="divider">
						<view class="divider-line"></view>
						<text class="divider-text">其他登录方式</text>
						<view class="divider-line"></view>
					</view>
					
					<view class="login-methods">
						<view class="login-method" @click="wechatLogin">
							<image class="method-icon" src="/static/icons/wechat.png" mode="aspectFit"></image>
							<text class="method-text">微信登录</text>
						</view>
						<view class="login-method" @click="phoneLogin">
							<image class="method-icon" src="/static/icons/phone.png" mode="aspectFit"></image>
							<text class="method-text">手机登录</text>
						</view>
					</view>
				</view>
				
				<!-- 注册链接 -->
				<view class="register-link">
					<text class="link-text">还没有账号？</text>
					<text class="link-btn" @click="goToRegister">立即注册</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'

export default {
	name: 'Login',
	setup() {
		const userStore = useUserStore()
		
		// 表单数据
		const loginForm = ref({
			username: '',
			password: ''
		})
		
		// 状态数据
		const loading = ref(false)
		const showPassword = ref(false)
		const rememberMe = ref(false)
		
		// 计算属性
		const canLogin = computed(() => {
			return loginForm.value.username.trim() && loginForm.value.password.trim()
		})
		
		// 切换密码显示
		const togglePassword = () => {
			showPassword.value = !showPassword.value
		}
		
		// 切换记住密码
		const toggleRemember = () => {
			rememberMe.value = !rememberMe.value
		}
		
		// 处理登录
		const handleLogin = async () => {
			if (!canLogin.value) {
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none'
				})
				return
			}
			
			loading.value = true
			
			try {
				const result = await userStore.login(loginForm.value)
				
				if (result.success) {
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})
					
					// 跳转到首页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 1500)
				} else {
					uni.showToast({
						title: result.message || '登录失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('登录错误:', error)
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				})
			} finally {
				loading.value = false
			}
		}
		
		// 微信登录
		const wechatLogin = () => {
			uni.showToast({
				title: '微信登录功能开发中',
				icon: 'none'
			})
		}
		
		// 手机登录
		const phoneLogin = () => {
			uni.showToast({
				title: '手机登录功能开发中',
				icon: 'none'
			})
		}
		
		// 跳转到注册页
		const goToRegister = () => {
			uni.navigateTo({
				url: '/pages/register/register'
			})
		}
		
		// 跳转到忘记密码页
		const goToForgotPassword = () => {
			uni.showToast({
				title: '忘记密码功能开发中',
				icon: 'none'
			})
		}
		
		return {
			loginForm,
			loading,
			showPassword,
			rememberMe,
			canLogin,
			togglePassword,
			toggleRemember,
			handleLogin,
			wechatLogin,
			phoneLogin,
			goToRegister,
			goToForgotPassword
		}
	}
}
</script>

<style lang="scss" scoped>
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

/* 背景装饰 */
.bg-decoration {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
	z-index: 1;
	
	.circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		
		&.circle-1 {
			width: 300rpx;
			height: 300rpx;
			top: -150rpx;
			right: -150rpx;
			animation: float 6s ease-in-out infinite;
		}
		
		&.circle-2 {
			width: 200rpx;
			height: 200rpx;
			bottom: 100rpx;
			left: -100rpx;
			animation: float 8s ease-in-out infinite reverse;
		}
		
		&.circle-3 {
			width: 150rpx;
			height: 150rpx;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			animation: float 10s ease-in-out infinite;
		}
	}
}

@keyframes float {
	0%, 100% { transform: translateY(0px); }
	50% { transform: translateY(-20px); }
}

/* 登录表单 */
.login-form {
	width: 100%;
	max-width: 600rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 32rpx;
	padding: 60rpx 40rpx;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
	position: relative;
	z-index: 2;
}

/* Logo区域 */
.logo-section {
	text-align: center;
	margin-bottom: 60rpx;
	
	.logo {
		width: 120rpx;
		height: 120rpx;
		margin-bottom: 20rpx;
	}
	
	.app-title {
		display: block;
		font-size: 48rpx;
		font-weight: 700;
		color: #333;
		margin-bottom: 10rpx;
	}
	
	.app-subtitle {
		display: block;
		font-size: 28rpx;
		color: #666;
	}
}

/* 表单内容 */
.form-content {
	.input-group {
		margin-bottom: 40rpx;
		
		.input-item {
			position: relative;
			margin-bottom: 30rpx;
			display: flex;
			align-items: center;
			background: #f8f9fa;
			border-radius: 16rpx;
			padding: 0 20rpx;
			height: 100rpx;
			
			.input-icon {
				width: 40rpx;
				height: 40rpx;
				margin-right: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.iconfont {
					font-size: 36rpx;
					color: #999;
				}
			}
			
			.input-field {
				flex: 1;
				height: 100%;
				font-size: 32rpx;
				color: #333;
				border: none;
				background: transparent;
				
				&::placeholder {
					color: #999;
				}
			}
			
			.password-toggle {
				width: 40rpx;
				height: 40rpx;
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
	
	.form-options {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 40rpx;
		
		.remember-me {
			display: flex;
			align-items: center;
			
			.checkbox {
				width: 32rpx;
				height: 32rpx;
				border: 2rpx solid #ddd;
				border-radius: 6rpx;
				margin-right: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				
				&.checked {
					background: #007aff;
					border-color: #007aff;
					
					.iconfont {
						color: #fff;
						font-size: 20rpx;
					}
				}
			}
			
			.option-text {
				font-size: 28rpx;
				color: #666;
			}
		}
		
		.forgot-password {
			font-size: 28rpx;
			color: #007aff;
		}
	}
	
	.login-btn {
		width: 100%;
		height: 100rpx;
		background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
		border-radius: 16rpx;
		border: none;
		margin-bottom: 40rpx;
		position: relative;
		overflow: hidden;
		
		&.loading {
			opacity: 0.8;
		}
		
		&:disabled {
			opacity: 0.6;
		}
		
		.btn-content {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			
			.loading-spinner {
				width: 32rpx;
				height: 32rpx;
				border: 3rpx solid rgba(255, 255, 255, 0.3);
				border-top: 3rpx solid #fff;
				border-radius: 50%;
				animation: spin 1s linear infinite;
				margin-right: 16rpx;
			}
			
			text {
				font-size: 32rpx;
				color: #fff;
				font-weight: 600;
			}
		}
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
}

/* 其他登录方式 */
.other-login {
	margin-bottom: 40rpx;
	
	.divider {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		
		.divider-line {
			flex: 1;
			height: 1rpx;
			background: #e5e5e5;
		}
		
		.divider-text {
			margin: 0 20rpx;
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.login-methods {
		display: flex;
		justify-content: center;
		gap: 60rpx;
		
		.login-method {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.method-icon {
				width: 80rpx;
				height: 80rpx;
				margin-bottom: 12rpx;
			}
			
			.method-text {
				font-size: 24rpx;
				color: #666;
			}
		}
	}
}

/* 注册链接 */
.register-link {
	text-align: center;
	
	.link-text {
		font-size: 28rpx;
		color: #666;
		margin-right: 10rpx;
	}
	
	.link-btn {
		font-size: 28rpx;
		color: #007aff;
		font-weight: 600;
	}
}
</style>
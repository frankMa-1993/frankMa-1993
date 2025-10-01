<template>
	<view class="register-container">
		<!-- 背景装饰 -->
		<view class="bg-decoration">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>
		
		<!-- 注册表单 -->
		<view class="register-form">
			<!-- 标题 -->
			<view class="title-section">
				<text class="page-title">创建账号</text>
				<text class="page-subtitle">加入我们，开始你的社交之旅</text>
			</view>
			
			<!-- 注册表单 -->
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
							v-model="registerForm.username"
							:disabled="loading"
						/>
					</view>
					
					<view class="input-item">
						<view class="input-icon">
							<text class="iconfont icon-nickname"></text>
						</view>
						<input 
							class="input-field" 
							type="text" 
							placeholder="请输入昵称" 
							v-model="registerForm.nickname"
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
							v-model="registerForm.password"
							:disabled="loading"
						/>
						<view class="password-toggle" @click="togglePassword">
							<text class="iconfont" :class="showPassword ? 'icon-eye-open' : 'icon-eye-close'"></text>
						</view>
					</view>
					
					<view class="input-item">
						<view class="input-icon">
							<text class="iconfont icon-lock"></text>
						</view>
						<input 
							class="input-field" 
							:type="showConfirmPassword ? 'text' : 'password'" 
							placeholder="请确认密码" 
							v-model="registerForm.confirmPassword"
							:disabled="loading"
						/>
						<view class="password-toggle" @click="toggleConfirmPassword">
							<text class="iconfont" :class="showConfirmPassword ? 'icon-eye-open' : 'icon-eye-close'"></text>
						</view>
					</view>
					
					<view class="input-item">
						<view class="input-icon">
							<text class="iconfont icon-phone"></text>
						</view>
						<input 
							class="input-field" 
							type="number" 
							placeholder="请输入手机号（可选）" 
							v-model="registerForm.phone"
							:disabled="loading"
						/>
					</view>
					
					<view class="input-item">
						<view class="input-icon">
							<text class="iconfont icon-email"></text>
						</view>
						<input 
							class="input-field" 
							type="text" 
							placeholder="请输入邮箱（可选）" 
							v-model="registerForm.email"
							:disabled="loading"
						/>
					</view>
				</view>
				
				<!-- 协议同意 -->
				<view class="agreement-section">
					<view class="agreement-item" @click="toggleAgreement">
						<view class="checkbox" :class="{ 'checked': agreeToTerms }">
							<text class="iconfont icon-check" v-if="agreeToTerms"></text>
						</view>
						<text class="agreement-text">
							我已阅读并同意
							<text class="link-text" @click.stop="showTerms">《用户协议》</text>
							和
							<text class="link-text" @click.stop="showPrivacy">《隐私政策》</text>
						</text>
					</view>
				</view>
				
				<!-- 注册按钮 -->
				<button 
					class="register-btn" 
					:class="{ 'loading': loading }"
					:disabled="loading || !canRegister"
					@click="handleRegister"
				>
					<view class="btn-content">
						<view class="loading-spinner" v-if="loading"></view>
						<text>{{ loading ? '注册中...' : '立即注册' }}</text>
					</view>
				</button>
				
				<!-- 登录链接 -->
				<view class="login-link">
					<text class="link-text">已有账号？</text>
					<text class="link-btn" @click="goToLogin">立即登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'

export default {
	name: 'Register',
	setup() {
		const userStore = useUserStore()
		
		// 表单数据
		const registerForm = ref({
			username: '',
			nickname: '',
			password: '',
			confirmPassword: '',
			phone: '',
			email: ''
		})
		
		// 状态数据
		const loading = ref(false)
		const showPassword = ref(false)
		const showConfirmPassword = ref(false)
		const agreeToTerms = ref(false)
		
		// 计算属性
		const canRegister = computed(() => {
			return registerForm.value.username.trim() && 
				   registerForm.value.nickname.trim() &&
				   registerForm.value.password.trim() &&
				   registerForm.value.confirmPassword.trim() &&
				   registerForm.value.password === registerForm.value.confirmPassword &&
				   agreeToTerms.value
		})
		
		// 切换密码显示
		const togglePassword = () => {
			showPassword.value = !showPassword.value
		}
		
		// 切换确认密码显示
		const toggleConfirmPassword = () => {
			showConfirmPassword.value = !showConfirmPassword.value
		}
		
		// 切换协议同意
		const toggleAgreement = () => {
			agreeToTerms.value = !agreeToTerms.value
		}
		
		// 处理注册
		const handleRegister = async () => {
			if (!canRegister.value) {
				if (!registerForm.value.username.trim()) {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					})
				} else if (!registerForm.value.nickname.trim()) {
					uni.showToast({
						title: '请输入昵称',
						icon: 'none'
					})
				} else if (!registerForm.value.password.trim()) {
					uni.showToast({
						title: '请输入密码',
						icon: 'none'
					})
				} else if (registerForm.value.password !== registerForm.value.confirmPassword) {
					uni.showToast({
						title: '两次密码输入不一致',
						icon: 'none'
					})
				} else if (!agreeToTerms.value) {
					uni.showToast({
						title: '请同意用户协议和隐私政策',
						icon: 'none'
					})
				}
				return
			}
			
			loading.value = true
			
			try {
				const result = await userStore.register(registerForm.value)
				
				if (result.success) {
					uni.showToast({
						title: '注册成功',
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
						title: result.message || '注册失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('注册错误:', error)
				uni.showToast({
					title: '注册失败，请重试',
					icon: 'none'
				})
			} finally {
				loading.value = false
			}
		}
		
		// 显示用户协议
		const showTerms = () => {
			uni.showModal({
				title: '用户协议',
				content: '这里是用户协议的内容...',
				showCancel: false
			})
		}
		
		// 显示隐私政策
		const showPrivacy = () => {
			uni.showModal({
				title: '隐私政策',
				content: '这里是隐私政策的内容...',
				showCancel: false
			})
		}
		
		// 跳转到登录页
		const goToLogin = () => {
			uni.navigateBack()
		}
		
		return {
			registerForm,
			loading,
			showPassword,
			showConfirmPassword,
			agreeToTerms,
			canRegister,
			togglePassword,
			toggleConfirmPassword,
			toggleAgreement,
			handleRegister,
			showTerms,
			showPrivacy,
			goToLogin
		}
	}
}
</script>

<style lang="scss" scoped>
.register-container {
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

/* 注册表单 */
.register-form {
	width: 100%;
	max-width: 600rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 32rpx;
	padding: 60rpx 40rpx;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
	position: relative;
	z-index: 2;
	max-height: 90vh;
	overflow-y: auto;
}

/* 标题区域 */
.title-section {
	text-align: center;
	margin-bottom: 40rpx;
	
	.page-title {
		display: block;
		font-size: 48rpx;
		font-weight: 700;
		color: #333;
		margin-bottom: 10rpx;
	}
	
	.page-subtitle {
		display: block;
		font-size: 28rpx;
		color: #666;
	}
}

/* 表单内容 */
.form-content {
	.input-group {
		margin-bottom: 30rpx;
		
		.input-item {
			position: relative;
			margin-bottom: 24rpx;
			display: flex;
			align-items: center;
			background: #f8f9fa;
			border-radius: 16rpx;
			padding: 0 20rpx;
			height: 90rpx;
			
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
	
	.agreement-section {
		margin-bottom: 40rpx;
		
		.agreement-item {
			display: flex;
			align-items: flex-start;
			
			.checkbox {
				width: 32rpx;
				height: 32rpx;
				border: 2rpx solid #ddd;
				border-radius: 6rpx;
				margin-right: 12rpx;
				margin-top: 4rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				flex-shrink: 0;
				
				&.checked {
					background: #007aff;
					border-color: #007aff;
					
					.iconfont {
						color: #fff;
						font-size: 20rpx;
					}
				}
			}
			
			.agreement-text {
				font-size: 24rpx;
				color: #666;
				line-height: 1.5;
				
				.link-text {
					color: #007aff;
				}
			}
		}
	}
	
	.register-btn {
		width: 100%;
		height: 100rpx;
		background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
		border-radius: 16rpx;
		border: none;
		margin-bottom: 30rpx;
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

/* 登录链接 */
.login-link {
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
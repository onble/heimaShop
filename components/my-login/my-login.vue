<template>
	<view class="login-container">
		<!-- 提示登录的图片 -->
		<uni-icons type="contact-filled" size="100" color="#AFAFAF"></uni-icons>
		<!-- 登录按钮 -->
		<!-- 可以从@getuserinfo事件处理函数的形参中，获取到用户的基本信息 -->
		<button type="primary" class="btn-login" open-type="getUserInfo" @getuserinfo="getUserInfo">一键登录</button>
		<!-- 登录提示 -->
		<view class="tips-text">登陆后尽享更多权益</view>
	</view>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
	name: 'my-login',
	data() {
		return {};
	},
	computed: {
		...mapState('m_user', ['redirectInfo'])
	},
	methods: {
		...mapMutations('m_user', ['updateUserInfo', 'updateToken', 'updateRedirectInfo']),
		// 获取微信用户的基本信息
		getUserInfo(e) {
			// console.log(e);

			// 判断是否获取用户信息成功
			if (e.detail.errMsg === 'getUserInfo:fail auth deny') return uni.$showMsg('您取消了登录授权!');

			// 获取用户信息成功 e.detail.userInfo就是用户的基本信息
			// console.log(e.detail.userInfo);

			// 将用户的基本信息存储到vuex中
			this.updateUserInfo(e.detail.userInfo);

			// 获取登录成功后的Token字符串
			this.getToken(e.detail);
		},
		// 调用微信登录接口
		async getToken(info) {
			// 调用微信登录接口
			const [err, res] = await uni.login().catch((err) => err);

			// console.log('res', res);

			// 判断是否wx.login()调用失败
			if (err || res.errMsg !== 'login:ok') return uni.$showError('登录失败');

			// console.log(res.code);
			// console.log(info);

			// 准备参数对象
			const query = {
				// code: res.code,
				code: '0a3hsD000F2zfQ1cap199PYSVE0hsD0b',
				encryptedData: info.encryptedData,
				iv: info.iv,
				rawData: info.rawData,
				signature: info.signature
			};

			console.log('query', query);

			// 换取token
			// TODO:将参数发给别人的服务器多少有点不安全吧
			// const { data: loginResult } = await uni.$http.post('/api/public/v1/users/wxlogin', query);
			// if (loginResult.meta.status !== 200) return uni.$showMsg('登录失败!');

			const loginResult = {
				message: {
					token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIzLCJpYXQiOjE1NjQ3MzAwNzksImV4cCI6MTAwMTU2NDczMDA3OH0.YPt-XeLnjV-_1ITaXGY2FhxmCe4NvXuRnRB8OMCfnPo'
				}
			};

			uni.$showMsg('登录成功');

			// 更新vuex中的token
			this.updateToken(loginResult.message.token);

			// 判断vuex中的redirectInfo是否为null
			// 如果不为null,则登录成功之后，需要重新导航到对应的页面
			this.navigateBack();
		},
		// 返回登录之前的页面
		navigateBack() {
			// redirectInfo不为bull,并且导航方式为switchTab
			console.log('redirectInfo', this.redirectInfo);
			if (this.redirectInfo && this.redirectInfo.openType === 'switchTab') {
				// 调用小程序提供的uni.switchTab() API 进行页面的导航
				uni.switchTab({
					// 要导航到的页面地址
					url: this.redirectInfo.from,
					// 导航完成之后，把vuex中的redirectInfo对象重置为null
					complete: () => {
						this.updateRedirectInfo(null);
					}
				});
			}
		}
	}
};
</script>

<style lang="scss">
.login-container {
	// 登录盒子的样式
	height: 750rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #f8f8f8;
	position: relative;
	overflow: hidden;

	// 底部的椭圆曲线
	&::after {
		content: ' ';
		display: block;
		width: 100%;
		height: 40px;
		background-color: white;
		position: absolute;
		bottom: 0;
		left: 0;
		border-radius: 100%;
		transform: translateY(50%);
	}

	.btn-login {
		width: 90%;
		border-radius: 100px;
		margin: 15px 0;
		background-color: #c00000;
	}
	.tips-text {
		font-size: 12px;
		color: gray;
	}
}
</style>

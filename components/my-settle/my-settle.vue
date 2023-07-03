<template>
	<view class="my-settle-container">
		<!-- 全选 -->
		<label class="radio" @click="changeAllState">
			<radio color="#C00000" :checked="isFullCheck" />
			<text>全选</text>
		</label>

		<!-- 合计 -->
		<view class="amount-box">
			合计：
			<text class="amount">￥{{ checkedGoodsAmount }}</text>
		</view>

		<!-- 结算按钮 -->
		<view class="btn-settle" @click="settlement">结算({{ checkedCount }})</view>
	</view>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
	name: 'my-settle',
	data() {
		return {
			// 倒计时的秒数
			seconds: 3,
			// 定时器的Id
			timer: null
		};
	},
	computed: {
		...mapGetters('m_cart', ['checkedCount', 'total', 'checkedGoodsAmount']),
		...mapGetters('m_user', ['addstr']),
		...mapState('m_user', ['token']),
		...mapState('m_cart', ['cart']),
		isFullCheck() {
			return this.total === this.checkedCount;
		}
	},
	methods: {
		...mapMutations('m_cart', ['updateAllGoodsState']),
		...mapMutations('m_user', ['updateRedirectInfo']),
		// label的点击事件处理函数
		changeAllState() {
			// 修稿购物车中所有商品的选中状态
			this.updateAllGoodsState(!this.isFullCheck);
		},
		// 点击了结算按钮
		settlement() {
			// 先判断是否勾选了要结算的商品
			if (!this.checkedCount) return uni.$showMsg('请选择要结算的商品!');

			// 再判断用户是否选择了收货地址
			if (!this.addstr) return uni.$showMsg('请选择收货地址!');

			// 最后判断用户是否登录了
			// if (!this.token) return uni.$showMsg('请先登录!');
			if (!this.token) return this.delayNavigate();

			// 实现微信支付功能
			this.payOrder();
		},
		// 微信支付
		async payOrder() {
			// 创建订单
			// 组织订单的信息对象
			const orderInfo = {
				// 开发期间，注释掉真实的订单价格，
				// order_price: this.checkedGoodsAmount,
				// 写死订单总价为1分钱
				order_price: 0.01,
				consignee_addr: this.addstr,
				goods: this.cart.filter((x) => x.goods_state).map((x) => ({ goods_id: x.goods_id, goods_number: x.goods_count, goods_price: x.goods_price }))
			};
			// 发起请求创建订单
			const { data: res } = await uni.$http.post('/api/public/v1/my/orders/create', orderInfo);
			// console.log('res', res);
			// if (res.meta.status !== 200) return uni.$showMsg('创建订单失败!');
			// 得到服务器响应的”订单编号“
			// const orderNumber = res.message.order_number;

			// 获取不到，直接写死一个
			const orderNumber = 'fake orderNumber';

			// 订单预支付
			// 发起请求获取订单的支付信息
			const { data: res2 } = await uni.$http.post('/api/public/v1/my/orders/req_unifiedorder', { order_number: orderNumber });

			// console.log('res2', res2);

			// 预支付订单生成失效
			// if (res2.meta.status !== 200) return uni.$showMsg('预支付订单生成失败!');

			// 得到订单支付相关的必要参数
			// const payInfo = res2.message.pay;

			// 获取不到，直接写死
			const payInfo = { nonceStr: 'fake', package: 'fake', paySign: 'fake', signType: 'MD5', timeStamp: 'fake' };

			// 发起微信支付
			// 调用uni.requestPayment()发起微信支付
			const res_temp = await uni.requestPayment(payInfo);

			// console.log('res_temp', res_temp);

			const [err, succ] = res_temp;

			// console.log('err, succ', err, succ);

			// 未完成支付
			// if (err) return uni.$showMsg('订单未支付!');
			// 完成了支付，进一步查询支付的结果
			const { data: res3 } = await uni.$http.post('/api/public/v1/my/orders/cjkOrder', { order_number: orderNumber });

			// console.log('res3', res3);

			// 检测到订单未支付
			// if (res3.meta.status !== 200) return uni.$showMsg('订单未支付!');

			// 检测到订单支付完成
			uni.showToast({
				title: '支付完成!',
				icon: 'success'
			});

			// console.log('done');
		},
		// 展示倒计时的提示消息
		showTips(n) {
			// 调用uni.showToast()方法，展示提示消息
			uni.showToast({
				// 不展示任何图标
				icon: 'none',
				// 提示的消息
				title: '请登录后再结算! ' + n + ' 秒后自动跳转到登录页',
				// 为页面添加透明遮罩，防止点击穿透
				mask: true,
				// 1.5秒后自动消失
				duration: 1500
			});
		},
		// 延迟导航到my页面
		delayNavigate() {
			// 把data中的秒数重置成3秒
			this.seconds = 3;

			// 展示提示消息，此时seconds的值等于3
			this.showTips(this.seconds);

			// 将定时器的id存储到timer中
			// 创建定时器，每隔1秒执行一次
			this.timer = setInterval(() => {
				// 先让秒数自减1
				this.seconds--;

				// 判断秒数是否 <= 0
				if (this.seconds <= 0) {
					// 清除定时器
					clearInterval(this.timer);

					// 跳转到my页面
					uni.switchTab({
						url: '/pages/my/my',
						// 页面跳转成功之后的回调函数
						success: () => {
							// 调用vuex的updateRedirectInfo方法，把跳转信息存储到Store中
							this.updateRedirectInfo({
								// 跳转的方式
								openType: 'switchTab',
								// 从哪个页面跳转过去的
								from: '/pages/cart/cart'
							});
						}
					});

					// 终止后续代码的运行（当秒数为0时，不再展示toast提示消息）
					return;
				}

				// 再根据最新的秒数，进行消息提示
				this.showTips(this.seconds);
			}, 1000);
		}
	}
};
</script>

<style lang="scss">
.my-settle-container {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 50px;
	background-color: white;

	z-index: 999;

	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;
	padding-left: 5px;

	.radio {
		display: flex;
		align-items: center;
	}
	.amount-box {
		.amount {
			color: #c00000;
			font-weight: bold;
		}
	}
	.btn-settle {
		background-color: #c00000;
		height: 50px;
		color: white;
		line-height: 50px;
		padding: 0 10px;
		min-width: 100px;
		text-align: center;
	}
}
</style>

<template>
	<view class="cart-container" v-if="cart.length !== 0">
		<!-- 收获地址组件 -->
		<my-address></my-address>
		<!-- 购物车商品列表的标题区域 -->
		<view class="cart-title">
			<!-- 左侧的图标 -->
			<uni-icons type="shop" size="18"></uni-icons>
			<!-- 右侧的描述文本 -->
			<text class="cart-title-text">购物车</text>
		</view>

		<!-- 商品列表区域 -->
		<!-- uni-swipe-action 是最外层包裹性质的容器 -->
		<uni-swipe-action>
			<block v-for="(goods, i) in cart" :key="i">
				<!-- uni-swipe-action-item 可以为其子节点提供滑动操作的效果，需要通过options属性来指定操作按钮的配置信息 -->
				<uni-swipe-action-item :rightOptions="options" @click="swipeActionClickHandler(goods)">
					<my-goods :goods="goods" :show-radio="true" :show-num="true" @radio-change="radioChangeHandler" @num-change="numberChangeHandler"></my-goods>
				</uni-swipe-action-item>
			</block>
		</uni-swipe-action>

		<!-- 使用自定义的结算组件 -->
		<my-settle></my-settle>
	</view>

	<!-- 空白购物车区域 -->
	<view class="empty-cart" v-else>
		<image src="/static/cart_empty@2x.png" class="empty-img"></image>
		<text class="tip-text">空空如也~</text>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
// 导入自己封装的mixin模块
import badgeMix from '@/mixins/tabbar-badge.js';
export default {
	// 将badgeMix混入到当前的页面中进行使用
	mixins: [badgeMix],
	data() {
		return {
			options: [
				{
					text: '删除', //显示的文本内容
					style: {
						backgroundColor: '#C00000' // 按钮的背景颜色
					}
				}
			]
		};
	},
	computed: {
		// 将m_cart模块中的cart数组映射到当前页面中使用
		...mapState('m_cart', ['cart'])
	},
	methods: {
		...mapMutations('m_cart', ['updateGoodsState', 'updateGoodsCount', 'removeGoodsById']),
		// 商品的勾选状态发生了变化
		radioChangeHandler(e) {
			// console.log(e);
			// 输出得到的数据 -> {goods_id: 395, goods_state: false}
			this.updateGoodsState(e);
		},
		// 商品的数量发生了变化
		numberChangeHandler(e) {
			// console.log(e);
			this.updateGoodsCount(e);
		},
		swipeActionClickHandler(goods) {
			// console.log('swipeActionClickHandler', goods);
			this.removeGoodsById(goods.goods_id);
		}
	}
};
</script>

<style lang="scss">
.cart-container {
	padding-bottom: 50px;
}
.cart-title {
	height: 40px;
	display: flex;
	align-items: center;
	font-size: 14px;
	padding-left: 5px;
	border-bottom: 1px solid #efefef;
	.cart-title-text {
		margin-left: 10px;
	}
}

// 空白购物车区域
.empty-cart {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 150px;

	.empty-img {
		width: 90px;
		height: 90px;
	}
	.tip-text {
		font-size: 12px;
		color: gray;
		margin-top: 15px;
	}
}
</style>

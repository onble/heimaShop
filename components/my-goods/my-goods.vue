<template>
	<view class="goods-item">
		<!-- 商品左侧图片区域 -->
		<view class="goods-item-left">
			<radio :checked="goods.goods_state" color="#C00000" v-if="showRadio" @click="radioClickHandler"></radio>
			<image :src="goods.goods_small_logo || defaultPic" class="goods-pic"></image>
		</view>
		<!-- 商品右侧信息区域 -->
		<view class="goods-item-right">
			<!-- 商品标题 -->
			<view class="goods-name">
				{{ goods.goods_name }}
			</view>
			<view class="goods-info-box">
				<!-- 商品价格 -->
				<view class="goods-price">￥{{ goods.goods_price | tofixed }}</view>
				<!-- 商品数量 -->
				<uni-number-box :min="1" :value="goods.goods_count" @change="numChangeHandler" v-if="showNum" @blur="numBlur"></uni-number-box>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'my-goods',
	props: {
		goods: {
			type: Object,
			default: {}
		},
		// 是否展示图片左侧的radio
		showRadio: {
			type: Boolean,
			// 如果外界没有指定show-radio属性的值，则默认不展示radio组件
			default: false
		},
		// 是否展示价格右侧的NumberBox组件
		showNum: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return { defaultPic: 'https://img3.doubanio.com/f/movie/8dd0c794499fe925ae2ae89ee30cd225750457b4/pics/movie/celebrity-default-medium.png' };
	},
	filters: {
		// 把数字处理为带两位小数点的数字
		tofixed(num) {
			return Number(num).toFixed(2);
		}
	},
	methods: {
		// radio组件的点击事件处理函数
		radioClickHandler() {
			// 通过this.$emit()触发外界通过@绑定的radio-change事件
			// 同时把商品的id和勾选状态作为参数传递给radio-change事件处理函数
			this.$emit('radio-change', {
				// 商品的id
				goods_id: this.goods.goods_id,
				// 商品最新的勾选状态
				goods_state: !this.goods.goods_state
			});
		},
		// NumberBox组件的change事件处理函数
		numChangeHandler(val) {
			// console.log(val);
			// val的值是NumberBox更新后的数字
			// 通过this.$emit()触发外界通过@绑定的num-change事件
			this.$emit('num-change', {
				// 商品的id
				goods_id: this.goods.goods_id,
				// 商品的最新数量
				// 通过+来实现字符串转数字
				goods_count: +val
			});
			/* // 上面为黑马程序员的代码，讲解时候编辑了源码，下面将编辑源码实现的功能修改到下面
			let value = parseInt(val);
			if (!value) {
				// 如果转化之后的结果为NAN,则给定默认值为1
				this.inputValue = 1;
			}
			this.$emit('num-change', {
				// 商品的id
				goods_id: this.goods.goods_id,
				// 商品的最新数量
				// 通过+来实现字符串转数字
				goods_count: value
			}); */
			// 测试发现源码似乎改进了，不用写了
			// 后来发现源码对NAN处理的不行，改在blur触发的函数中进行处理
		},
		numBlur(event) {
			let value = event.detail.value;
			value = parseInt(value);
			// console.log('bul_value', value);
			if (!value) {
				// 如果转化之后的结果为NAN,则给定默认值为1
				event.detail.value = 1;
			} else {
				event.detail.value = value;
			}
			return;
		}
	}
};
</script>

<style lang="scss">
.goods-item {
	display: flex;
	padding: 10px 5px;
	border-bottom: 1px solid #f0f0f0;

	// 防止右侧的数字框不贴边
	// 让goods-item项占满整个屏幕的宽度
	width: 750rpx;
	// 设置盒模型为border-box
	box-sizing: border-box;

	.goods-item-left {
		margin-right: 5px;

		display: flex;
		justify-content: space-between;
		align-items: center;

		.goods-pic {
			width: 100px;
			height: 100px;
			display: block;
		}
	}
	.goods-item-right {
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		// 占整个右侧的剩余空间
		flex: 1;
		.goods-name {
			font-size: 13px;
		}

		.goods-info-box {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.goods-price {
				color: #c00000;
				font-size: 16px;
			}
		}
	}
}
</style>

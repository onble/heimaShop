<template>
	<!-- 
		解决商品价格闪烁的问题
			导致问题的愿意：在商品详情数据请求回来之前，data中goods)info的值为{}，因此初次渲染页面时，回导致闪烁出undefine
			解决方法：判断goods_info.goods_name属性的值是否存在，从而使用v-if指令控制页面的显示与隐藏
	-->
	<view v-if="goods_info.goods_name" class="goods-detail-container">
		<!-- 轮播图区域 -->
		<swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true">
			<swiper-item v-for="(item, i) in goods_info.pics" :key="i">
				<image :src="item.pics_big" @click="preview(i)"></image>
			</swiper-item>
		</swiper>

		<!-- 商品信息区域 -->
		<view class="goods-info-box">
			<!-- 商品价格 -->
			<view class="price">￥{{ goods_info.goods_price }}</view>
			<!-- 信息主体区域 -->
			<view class="goods-info-body">
				<!-- 商品名称 -->
				<view class="goods-name">{{ goods_info.goods_name }}</view>
				<!-- 收藏 -->
				<view class="favi">
					<uni-icons type="star" size="18" color="gray"></uni-icons>
					<text>收藏</text>
				</view>
			</view>
			<!-- 运费 -->
			<view class="yf">快递，免运费</view>
		</view>

		<!-- 商品详情信息 -->
		<rich-text :nodes="goods_info.goods_introduce"></rich-text>

		<!-- 商品导航组件 -->
		<view class="goods_nav">
			<uni-goods-nav :fill="true" :options="options" :buttonGroup="buttonGroup" @click="onClick" @buttonClick="buttonClick"></uni-goods-nav>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 商品详情对象
			goods_info: [],
			// 左侧按钮组的配置对象
			options: [
				{
					icon: 'shop',
					text: '店铺'
				},
				{
					icon: 'cart',
					text: '购物车',
					info: 2
				}
			],
			// 右侧按钮组的配置对象
			buttonGroup: [
				{
					text: '加入购物车',
					backgroundColor: '#ff0000',
					color: '#fff'
				},
				{
					text: '立即购买',
					backgroundColor: '#ffa200',
					color: '#fff'
				}
			]
		};
	},
	onLoad(options) {
		// 获取商品Id
		const goods_id = options.goods_id;
		// 调用请求商品详情数据的方法
		this.getGoodsDetail(goods_id);
	},
	methods: {
		// 定义请求商品详情数据的方法
		async getGoodsDetail(goods_id) {
			const { data: res } = await uni.$http.get('/api/public/v1/goods/detail', { goods_id });
			if (res.meta.status !== 200) return uni.$showMsg();

			// 使用字符串的replace()方法，为img标签添加行内的style样式，从而解决图片底部空白间隙的问题
			// 更改webp图片格式来让ios正常显示图片
			res.message.goods_introduce = res.message.goods_introduce.replace(/<img /g, '<img style="display:block;" ').replace(/webp/g, 'jpg');

			// 为data中的数据赋值
			this.goods_info = res.message;
		},
		// 实现轮播图的预览效果
		preview(i) {
			// 调用uni.previewImage()方法预览图片
			uni.previewImage({
				// 预览时，默认显示图片的索引
				current: i,
				// 所有图片url地址的数组
				urls: this.goods_info.pics.map((x) => x.pics_big)
			});
		},
		// 左侧按钮的点击事件处理函数
		onClick(e) {
			// console.log(e);

			if (e.content.text === '购物车') {
				// 切换到购物车页面
				uni.switchTab({
					url: '/pages/cart/cart'
				});
			}
		}
	}
};
</script>

<style lang="scss">
swiper {
	height: 750rpx;

	image {
		width: 100%;
		height: 100%;
	}
}

.goods-info-box {
	padding: 10px;
	padding-right: 0;
	.price {
		color: #c00000;
		font-size: 18px;
		margin: 10px 0;
	}
	.goods-info-body {
		display: flex;
		justify-content: space-between;

		.goods-name {
			font-size: 13px;
			margin-right: 10px;
		}
		.favi {
			width: 120px;
			font-size: 12px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			border-left: 1px solid #efefef;
			color: gray;
		}
	}
	.yf {
		font-size: 12px;
		color: gray;
		margin: 10px 0;
	}
}

// 商品导航组件
.goods_nav {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
}

// 最顶层的容器
.goods-detail-container {
	padding-bottom: 50px;
}
</style>

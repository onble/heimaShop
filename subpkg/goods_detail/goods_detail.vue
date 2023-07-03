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
// 从vuex中按需导出mapState辅助方法
import { mapState, mapMutations, mapGetters } from 'vuex';

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
					info: 0
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
	computed: {
		// 调用mapState方法，把m_cart模块中的cart数组映射到当前页面中，作为计算属性来使用
		// ...mapState('模块的名称',['要映射的数据名称1','要映射的数据名称2'])
		...mapState('m_cart', []),
		...mapGetters('m_cart', ['total'])
	},
	watch: {
		// 使用普通函数形式定义的watch侦听器，在页面首次加载后不会被调用。因此导致了商品详情页在首次加载完毕之后，不会将商品的总数量显示到商品导航区域
		/* // 监听total值的变化，通过第一个形参得到变化后的新值
		total(newVal) {
			// 通过数组的find方法，找到购物车按钮的配置对象
			const findResult = this.options.find((x) => x.text === '购物车');

			if (findResult) {
				// 动态为购物车按钮的info属性赋值
				findResult.info = newVal;
			}
		} */
		// 未来防止上述问题，下面使用对象的形式来定义watch侦听器
		total: {
			// handler属性用来定义侦听器的function处理函数
			handler(newVal) {
				// 通过数组的find方法，找到购物车按钮的配置对象
				const findResult = this.options.find((x) => x.text === '购物车');

				if (findResult) {
					// 动态为购物车按钮的info属性赋值
					findResult.info = newVal;
				}
			},
			// immediate属性用来声明此侦听器，是否在页面初次加载完毕后立即调用
			immediate: true
		}
	},
	methods: {
		...mapMutations('m_cart', ['addToCart']),
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
		},
		// 右侧按钮的点击事件处理函数
		buttonClick(e) {
			// console.log(e);

			// 判断是否点击了 加入购物车 按钮
			if (e.content.text == '加入购物车') {
				// 组织一个商品的信息对象
				const goods = {
					goods_id: this.goods_info.goods_id, // 商品的id
					goods_name: this.goods_info.goods_name, //商品的名称
					goods_price: this.goods_info.goods_price, // 商品的价格
					goods_count: 1, // 商品的数量
					goods_small_logo: this.goods_info.goods_small_logo, // 商品的图片
					goods_state: true // 商品的勾选状态
				};

				// 通过this调用映射过来的addToCart方法，把商品信息对象存储到购物车中
				this.addToCart(goods);
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

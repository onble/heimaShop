<template>
	<view>
		<view class="goods-list">
			<view v-for="(goods, i) in goodsList" :key="i" @click="gotoDetail(goods)">
				<my-goods :goods="goods"></my-goods>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 请求参数对象
			queryObj: {
				// 查询关键词
				query: '',
				// 商品分类Id
				cid: '',
				// 页码值
				pagenum: 1,
				// 每页显示多少条数据
				pagesize: 10
			},
			// 商品列表的数据
			goodsList: [],
			// 总数量，用来实现分页
			total: 0,
			// 是否正在请求数据
			isloading: false
		};
	},
	onLoad(options) {
		// 将页面参数转存到this.queryObj对象中
		this.queryObj.query = options.query || '';
		this.queryObj.cid = options.cid || '';

		// console.log(this.queryObj);

		// 嗲用获取商品列表数据的方法
		this.getGoodsList();
	},
	methods: {
		// 获取商品列表数据的方法
		async getGoodsList(cb) {
			// ** 打开节流阀
			this.isloading = true;
			// 发起请求
			const { data: res } = await uni.$http.get('/api/public/v1/goods/search', this.queryObj);
			// ** 关闭节流阀
			this.isloading = false;
			// 只要数据请求完毕，就立即按需调用cb回调函数
			cb && cb();

			if (res.meta.status !== 200) return uni.$showMsg();
			// 为数据赋值
			this.goodsList = [...this.goodsList, ...res.message.goods];
			this.total = res.message.total;
		},
		// 点击跳转到商品详情页面
		gotoDetail(item) {
			uni.navigateTo({
				url: '/subpkg/goods_detail/goods_detail?goods_id=' + item.goods_id
			});
		}
	},
	onReachBottom() {
		// 判断是否还有下一页数据
		if (this.queryObj.pagenum * this.queryObj.pagesize >= this.total) return uni.$showMsg('数据加载完毕!');

		// 判断是否正在请求其他数据，如果是，则不发起额外的请求
		if (this.isloading) return;
		// 让页码值自增+1
		this.queryObj.pagenum++;
		this.getGoodsList();
	},
	// 下拉刷新的事件
	onPullDownRefresh() {
		// 1.处置关键数据
		this.queryObj.pagenum = 1;
		this.total = 0;
		this.isloading = false;
		this.goodsList = [];

		// 2.重新发起请求
		this.getGoodsList(() => uni.stopPullDownRefresh());
	}
};
</script>

<style lang="scss"></style>

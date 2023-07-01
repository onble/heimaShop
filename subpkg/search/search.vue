<template>
	<view>
		<view class="search-box" style="background-color: #c00000">
			<uni-search-bar :focus="true" @input="input" :radius="100" cancel-button="none" placeholder="请输入搜索内容"></uni-search-bar>
		</view>

		<!-- 搜索建议列表 -->
		<view class="sugg-list" v-if="searchResults.length !== 0">
			<view class="sugg-item" v-for="(item, i) in searchResults" :key="i" @click="gotoDetail(item)">
				<view class="goods-name">{{ item.goods_name }}</view>
				<uni-icons type="arrowright" size="16"></uni-icons>
			</view>
		</view>

		<!-- 搜索历史记录 -->
		<view class="history-box" v-else>
			<!-- 标题区域 -->
			<view class="history-title">
				<text>搜索历史</text>
				<uni-icons type="trash" size="17" @click="clean"></uni-icons>
			</view>
			<!-- 列表区域 -->
			<view class="history-list">
				<uni-tag :text="item" v-for="(item, i) in histories" :key="i" inverted="true" class="uni-tag" @click="gotoGoodsList(item)"></uni-tag>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 延时器的 timerId
			timer: null,
			// 搜索关键词
			kw: '',
			// 搜索结果列表
			searchResults: [],
			// 搜索关键词的历史记录
			historyList: ['a', 'app', 'apple']
		};
	},
	onLoad() {
		this.historyList = JSON.parse(uni.getStorageSync('kw') || '[]');
	},
	methods: {
		// input 输入事件的处理函数
		input(e) {
			// console.log(e);
			// 清除timer对应的延时器
			clearTimeout(this.timer);
			// 重新启动一个延时器，并把timerId赋值给this.timer
			this.timer = setTimeout(() => {
				// 如果500毫秒内，没有触发新的输入事件，则为搜索关键词赋值
				this.kw = e;
				// console.log(this.kw);
				// 根据关键词,查询搜索建议列表
				this.getSearchList();
			}, 500);
		},
		async getSearchList() {
			// 判断搜索关键词是否为空
			if (this.kw.length === 0) {
				this.searchResults = [];
				return;
			}

			const { data: res } = await uni.$http.get('/api/public/v1/goods/qsearch', { query: this.kw });
			if (res.meta.status !== 200) return uni.$showMsg();
			this.searchResults = res.message;

			// 查询到搜索建议之后，调用saveSearchHistory()方法保存关键词
			this.saveSearchHistory();
		},
		// 保存搜索关键词为历史记录
		saveSearchHistory() {
			// 直接吧搜索关键词push到historyList数组中
			// this.historyList.push(this.kw);
			// 上面实现思路存在问题
			// 关键词前后顺序的问题（可以调用数组的reverse()方法对数组进行反转）
			// 关键词重复问题（可以使用set对象进行去重操作）

			// 1.将Array数组转化为Set对象
			const set = new Set(this.historyList);
			// 2.调用Set对象的delete方法，移除对应的元素
			set.delete(this.kw);
			// 3.嗲用Set对象的add方法，向Set中添加元素
			set.add(this.kw);
			// 4.将Set对象转化为Array数组
			this.historyList = Array.from(set);
			// 将搜索历史记录持久化存储到本地
			uni.setStorageSync('kw', JSON.stringify(this.historyList));
		},
		gotoDetail(item) {
			uni.navigateTo({
				url: '/subpkg/goods_detail/goods_detail?goods_id=' + item.goods_id
			});
		},
		clean() {
			this.historyList = [];
			uni.setStorageSync('kw', '[]');
		},
		// 点击跳转到商品列表页面
		gotoGoodsList(kw) {
			uni.navigateTo({
				url: '/subpkg/goods_list/goods_list?query=' + kw
			});
		}
	},
	computed: {
		histories() {
			// 注意，由于数组是引用类型，所以不要直接基于原数组调用reverse方法，以免修改原数组中元素的顺序
			// 而是应该新建一个内存无关是数组，再进行reverse反转
			return [...this.historyList].reverse();
		}
	}
};
</script>

<style lang="scss">
.search-box {
	position: sticky;
	top: 0;
	z-index: 999;
}
.sugg-list {
	padding: 0 5px;

	.sugg-item {
		font-size: 12px;
		padding: 13px 0;
		border-bottom: 1px solid #efefef;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.goods-name {
			// 文字不允许换行（单行文本）
			white-space: nowrap;
			// 溢出部分隐藏
			overflow: hidden;
			// 文本溢出后，使用 ... 代替
			text-overflow: ellipsis;
			margin-right: 3px;
		}
	}
}

// 搜索历史
.history-box {
	padding: 0 5px;

	.history-title {
		display: flex;
		justify-content: space-between;
		height: 40px;
		align-items: center;
		font-size: 13px;
		border-bottom: 1px solid #efefef;
	}

	.history-list {
		display: flex;
		flex-wrap: wrap;

		.uni-tag {
			margin-top: 5px;
			margin-right: 5px;
		}
	}
}
</style>

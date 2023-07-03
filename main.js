// #ifndef VUE3
import Vue from 'vue'
import App from './App'

// 导入store的实例对象
import store from './store/store.js'

// 导入网络请求的包
import {
	$http
} from '@escook/request-miniprogram'

uni.$http = $http

// 请求的根路径
$http.baseUrl = 'https://api-hmugo-web.itheima.net'

// 配置请求拦截器，增加提示
$http.beforeRequest = function(options) {
	uni.showLoading({
		title: '数据加载中...'
	})
}

// 配置响应拦截器，关闭提示
$http.afterRequest = function() {
	uni.hideLoading()
}

// 封装弹框的方法
uni.$showMsg = function(title = '数据请求失败!', duration = 1500) {
	uni.showToast({
		title,
		duration,
		icon: 'none'
	})
}

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	...App,
	// 将store挂载到Vue实例上
	store
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import App from './App.vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif
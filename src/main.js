import Vue from 'vue'
import App from './App.vue'
import store from './store'
// // import VueMaterial from 'vue-material'
import './scss/base.scss'

// Vue.use(VueMaterial)
Vue.config.productionTip = false

// delete non recognized slocal storage
const version = localStorage.getItem('app-version')
const appVersion = '0.0.5'
if (version != appVersion) {
  // eslint-disable-next-line
  console.log('Wiped previous app version local storage.')
  localStorage.clear()
  localStorage.setItem('app-version', appVersion)
}

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')

store.dispatch('initialize')
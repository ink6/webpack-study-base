// 完整引入
import 'core-js'
// 按需加载
// import "core-js/es/promise";
import sum from './js/sum'
import count from './js/count'
// import { add } from './js/math' // 使用下面的异步代替
// 引入字体图标库
import './css/iconfont.css'
// 引入各种css
import './css/index.css'
import './less/index.less'
import './sass/index.sass'
import './sass/index.scss'
import './stylus/index.styl'

const res = sum(1, 2, 3, 4, 5)

// 判断是否支持HMR功能
if (module.hot){
  module.hot.accept(count) // 哪个模块需要热更新 就在这里写哪个 但是这样写会很麻烦，所以实际开发我们会使用其他 loader 来解决。比如：vue-loader, react-hot-loader
}
console.log(res);
console.log(count(9, 6));

// console.log(add(6,6));
document.getElementById('btn').onclick = function () {
  import(/* webpackChunkName: "math" */'./js/math')
  .then(({add}) => {
    add(6,6)
  })
}

// 添加promise代码
const promise = Promise.resolve();
promise.then(() => {
  console.log("hello promise");
});

const arr = [1, 2, 3, 4];
console.log(arr.includes(1));

// 断网依然可以访问
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
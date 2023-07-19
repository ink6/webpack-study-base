// Node.js的核心模块，专门用来处理文件路径 
// 执行命令 - npx webpack serve --config ./config/webpack.dev.js 但是如果配置在package.json中则不需要npx(加上也行) 因为运行指令的方式会默认把bin目录添加到环境变量中
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')
// 自动生成并引入html的插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  // 入口
  // 相对路径和绝对路径都行
  entry: './src/main.js', // 相对路径是node代码相对运行的目录 所以这里从最外层拉到config文件夹下不需要做修改 因为运行时候还是在最外层 但是用path.resolve拼接出来绝对路径的第二个参数（相对路径）要改 因为是相对当前文件的
  // 输出
  output: {
    // 开发模式没有输出
    path: undefined,
    // filename: 入口文件打包输出文件名
    filename: 'static/js/main.js', // 将 js 文件输出到 static/js 目录中
    // clean: true // 自动清空上次的打包内容 原理：打包前 将path整个目录清空 再进行打包  devserver无输出 所以这里可以不用写
  },
  // 加载器
  module: {
    rules: [
      //loader的配置
      {
        // 用来匹配 .css 结尾的文件 只检测.css结尾的文件
        test: /\.css$/,
        // use 数组里面 Loader 执行顺序是从右到左
        use: [
          'style-loader', // 将css通过创建style标签添加到html中进而生效
          'css-loader' // 将css资源编译成commonjs的模块到js中
        ]
      },
      {
        test: /\.less$/,
        // loader: 'xxxx', 只能使用一个loader
        use: [ // 使用多个loader
          'style-loader',
          'css-loader',
          'less-loader' // 将less 编译成css文件
        ]
      },
      {
        test: /\.s[ca]ss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader' // 将 sass/scss 编译成css文件
        ]
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          'stylus-loader' // 将 sass/scss 编译成css文件
        ]
      },
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/,
        // asset/resource 发送一个单独的文件并导出 URL。之前通过使用 file-loader(使url在webpack中使用) 实现。
        // asset/inline 导出一个资源的 data URI。之前通过使用 url-loader（base64） 实现。
        // asset/source 导出资源的源代码。之前通过使用 raw-loader 实现。
        // asset 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资源体积限制实现。
        type: 'asset', // 小于一个大小会转为base64
        parser: {
          dataUrlCondition: {
            // 小于10kb的图片转base64
            // 优点：减少请求数量  缺点：体积会更大
            maxSize: 10 * 1024 // 10kb
          }
        },
        generator: { // 将图片资源输出到指定目录
          // 将图片文件输出到 static/imgs 目录中
          // 将图片文件命名 [hash:8][ext][query]
          // [hash:8]: hash值取8位
          // [ext]: 使用之前的文件扩展名
          // [query]: 添加之前的query参数
          filename: 'static/images/[hash:10][ext][query]'
        }
      },
      {
        test: /\.(ttf|woff2?|map3|map4|avi)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[hash:10][ext][query]'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/, // 排除node_modules下的文件，其他文件都处理
        loader: 'babel-loader',
        // options: { // 也可以在单独的 babel.config.*（*是js|json） 或 .babelrc.* 中处理
        //   presets: ['@babel/preset-env']
        // }
      }
    ]
  },
  // 插件
  plugins: [
    new ESLintPlugin({
      // 指定检查文件的根目录
      context: path.resolve(__dirname, '../src')
    }),
    new HtmlWebpackPlugin({
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      template: path.resolve(__dirname, '../public/index.html')
    })
  ],
  // 开发服务器 不会输出资源 是在内存中进行编译打包的 使用devserver 命令需要修改成npx webpack serve
  devServer: { 
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
  },
  // 模式
  mode: 'development'// 开发模式
}
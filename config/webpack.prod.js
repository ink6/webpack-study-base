// Node.js的核心模块，专门用来处理文件路径
const path = require('path')
const os = require('os')
const ESLintPlugin = require('eslint-webpack-plugin')
// 自动生成并引入html的插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 解决style-loader 创建一个style 引入一个js文件带来的闪屏问题 修改为通过 link 标签加载 从而提升性能
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩css
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// 压缩js
const TereserPlugin = require("terser-webpack-plugin"); // 内置的插件不需要安装 生产环境默认开启 但这里引入是为了做一些额外的配置
// 压缩img
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin"); // 在浏览器空闲时间，加载后续需要使用的资源
const WorkboxPlugin = require("workbox-webpack-plugin"); //断网访问
const threads = os.cpus().length //cpu核数
// 用来获取处理样式的loader
function getStyleLoader(pre) {
  return [
    MiniCssExtractPlugin.loader, // 提取css成单独文件
    'css-loader', // 将css资源编译成commonjs的模块到js中
    {
      loader: "postcss-loader", // 对css兼容性进行处理
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", // 能解决大多数样式兼容性问题
          ],
        },
      },
    },
    pre // 这个pre是给该方法需要拓展的loader留一个位置
  ].filter(Boolean) // 这里的 filter(Boolean) 是为了过滤 pre不传 值为undefined的场景
}
module.exports = {
  // 入口
  // 相对路径和绝对路径都行
  entry: './src/main.js', // 相对路径是node 代码相对运行的目录 所以这里从最外层拉到config文件夹下不需要做修改 因为运行时候还是在最外层 但是绝对路径不行
  // 输出
  output: {
    // path: 所有文件输出目录，必须是绝对路径
    // path.resolve()方法返回一个绝对路径
    // __dirname 当前文件的文件夹绝对路径
    path: path.resolve(__dirname, '../devdist'),
    // filename: 入口文件打包输出文件名
    filename: 'static/js/[name].[contenthash:10].js', // 将 js 文件输出到 static/js 目录中
    // 给打包输出的其他文件命名
    chunkFilename: 'static/js/[name].[contenthash:10].chunk.js',
    // 图片、字体等通过type:asset处理资源命名方式
    assetModuleFilename: "static/media/[hash:10][ext][query]",
    clean: true // 自动清空上次的打包内容 原理：打包前 将path整个目录清空 再进行打包  devserver无输出 所以这里可以不用写
  },
  // 加载器
  module: {
    rules: [
      //loader的配置
      {
        oneOf: [
          {
            // 用来匹配 .css 结尾的文件 只检测.css结尾的文件
            test: /\.css$/,
            // use 数组里面 Loader 执行顺序是从右到左
            use: getStyleLoader()
          },
          {
            test: /\.less$/,
            // loader: 'xxxx', 只能使用一个loader
            use: getStyleLoader('less-loader')
          },
          {
            test: /\.s[ca]ss$/,
            use: getStyleLoader('sass-loader')
          },
          {
            test: /\.styl$/,
            use: getStyleLoader('stylus-loader')
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
            // generator: { // 将图片资源输出到指定目录 在上方output配置assetModuleFilename 也可以
            //   // 将图片文件输出到 static/imgs 目录中
            //   // 将图片文件命名 [hash:8][ext][query]
            //   // [hash:8]: hash值取8位
            //   // [ext]: 使用之前的文件扩展名
            //   // [query]: 添加之前的query参数
            //   filename: 'static/images/[hash:10][ext][query]'
            // }
          },
          {
            test: /\.(ttf|woff2?|map3|map4|avi)$/,
            type: 'asset/resource',
            // generator: { // 在上方output配置assetModuleFilename 也可以
            //   filename: 'static/media/[hash:10][ext][query]'
            // }
          },
          {
            test: /\.js$/,
            // exclude: /node_modules/, // 排除node_modules下的文件，其他文件都处理
            include: path.resolve(__dirname, '../src'),// 只处理src下的文件，其他文件不处理
            use: [
              {
                loader: 'thread-loader', // 开启多进程 thread-loader可以对babel eslint 和 Terser（压缩js）都进行处理
                options: {
                  workers: threads, // 数量
                },
              },
              {
                loader: 'babel-loader',
                options: { 
                  // presets: ['@babel/preset-env'] // 也可以在单独的 babel.config.*（*是js|json） 或 .babelrc.* 中处理
                  cacheDirectory: true, // 开启babel编译缓存 开启之后 node_modules会出现一个.cache的babel-loader缓存文件
                  cacheCompression: false // 缓存文件不要压缩
                }
              }
            ]
          }
        ]
      }
    ]
  },
  // 插件
  plugins: [
    new ESLintPlugin({
      // 指定检查文件的根目录
      context: path.resolve(__dirname, '../src'),
      exclude: "node_modules", // 默认值
      cache: true,// 开启缓存
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache'),
      threads: threads // 开启多进程和设置进程数量
    }),
    new HtmlWebpackPlugin({
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js、css等资源
      template: path.resolve(__dirname, '../public/index.html')
    }),
    new MiniCssExtractPlugin({
      // fullhash（webpack4 是 hash） 每次修改任何一个文件，所有文件名的 hash 至都将改变。所以一旦修改了任何一个文件，整个项目的文件缓存都将失效。
      // chunkhash 根据不同的入口文件(Entry)进行依赖文件解析、构建对应的 chunk，生成对应的哈希值。我们 js 和 css 是同一个引入，会共享一个 hash 值。
      // contenthash 根据文件内容生成 hash 值，只有文件内容变化了，hash 值才会变化。所有文件 hash 值是独享且不同的。
      filename: 'static/css/[name].[contenthash:10].css',
      chunkFilename: 'static/css/[name].[contenthash:10].chunk.css'
    }),
    new PreloadWebpackPlugin({
      // Preload加载优先级高，Prefetch加载优先级低。
      // Preload只能加载当前页面需要使用的资源，Prefetch可以加载当前页面资源，也可以加载下一个页面需要使用的资源。
      // rel: "preload", // preload兼容性更好
      // as: "script", // 会生成一个rel为script的link标签  <link href="static/js/math.chunk.js" rel="preload" as="script">
      rel: 'prefetch' // prefetch兼容性更差 <link href="static/js/math.chunk.js" rel="prefetch">
    }),
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助快速启用 ServiceWorkers
      // 不允许遗留任何“旧的” ServiceWorkers
      clientsClaim: true,
      skipWaiting: true,
    }),
    // css压缩也可以写到optimization.minimizer里面，效果一样的
    // new CssMinimizerPlugin(),
    // new TereserPlugin({
    //   parallel: threads // 开启多进程和设置进程数量
    // })
  ],
  optimization: {// webpack5更推荐把压缩相关的写在该配置下 而不是写在plugin配置文件中
    minimize: true,
    minimizer: [
      // css压缩也可以写到plugins里面，效果一样的
      new CssMinimizerPlugin(),
      new TereserPlugin({ // 生产模式会默认开启TerserPlugin，但是我们需要进行多进程等配置，就要重新写了
        parallel: threads // 开启多进程和设置进程数量
      }),
      // 压缩图片 - 会导致速度变慢 - 暂时注释
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
    // 代码分割配置 - 配置详解
    // splitChunks: {
    //   chunks: "all", // 对所有模块都进行分割
    //   // 以下是默认值
    //   // minSize: 20000, // 分割代码最小的大小
    //   // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
    //   // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
    //   // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
    //   // maxInitialRequests: 30, // 入口js文件最大并行请求数量
    //   // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
    //   // cacheGroups: { // 组，哪些模块要打包到一个组
    //   //   defaultVendors: { // 组名
    //   //     test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
    //   //     priority: -10, // 权重（越大越高）
    //   //     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
    //   //   },
    //   //   default: { // 其他没有写的配置会使用上面的默认值
    //   //     minChunks: 2, // 这里的minChunks权重更大
    //   //     priority: -20,
    //   //     reuseExistingChunk: true,
    //   //   },
    //   // },
    //   // 修改配置
    //   cacheGroups: {
    //     // 组，哪些模块要打包到一个组
    //     // defaultVendors: { // 组名
    //     //   test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
    //     //   priority: -10, // 权重（越大越高）
    //     //   reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
    //     // },
    //     default: {
    //       // 其他没有写的配置会使用上面的默认值
    //       minSize: 0, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
    //       minChunks: 2,
    //       priority: -20,
    //       reuseExistingChunk: true,
    //     },
    //   },
    // },
    splitChunks: {
      chunks: "all", // 对所有模块都进行分割
    },
    // 提取runtime文件 用这个文件做一个映射 当有文件a依赖文件b 但文件b修改时 ab都会生成新的chunk 使用runtime运行时文件可以保证 runtime文件和b文件会改变 但是文件a名称不会改变 从而更好的利用浏览器缓存
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}`, // runtime文件命名规则
    },
  },
  // 模式
  mode: 'production', // 开发模式
  devtool: "source-map"
}
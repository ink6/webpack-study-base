module.exports = {
  presets: [
    [
      '@babel/preset-env', // 智能预设：能够编译ES6语法
      // @babel/preset-react：一个用来编译 React jsx 语法的预设
      // @babel/preset-typescript：一个用来编译 TypeScript 语法的预设
      {
        useBuiltIns: "usage", // 按需加载自动引入
        corejs: 3,
      }
    ]
  ]
}

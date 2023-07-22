// 验证tree shaking 定义了但未使用的代码 最终不会被打包（prod默认开启）
export function add (a, b) {
  return a + b
}

export function mul (a, b) {
  return a * b
}
export function chu (a, b) {
  return a / b
}
export default function sum(...args) {
  return args.reduce((p,n)=> p+n, 0)
}
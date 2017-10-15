class Vue {
  constructor (options) {
    this.data = options.data
    this.methods = options.methods
    Object.keys(this.data).forEach(key => {this.proxyKeys(key)})
    observe(this.data)
    new Compile(options.el, this)
    options.mounted && options.mounted.call(this)
  }
  proxyKeys (key) {
    Object.defineProperty(this, key, {
      enumarable:true,
      configurable:true,
      get: () => this.data[key],
      set: val => this.data[key] = val
    })
  }
}

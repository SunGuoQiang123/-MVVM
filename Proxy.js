const obj = ['sgq', 'jack']
let proxy

class Dep {
  constructor () {
    this.deps = []
  }
  depend () {
    if (Dep.target && !this.deps.includes(Dep.target)) {
      this.deps.push(Dep.target)
    }
  }
  notify () {
    this.deps.forEach(sub => {
      console.log('watcher update')
      sub.update()
    })
  }
}

class Observer {
  constructor (data) {
    this.data = data
    this.deps = new Map()
    Object.keys(data).forEach(key => {
      this.deps.set(key, new Dep())
    })
    this.observe(data)
  }
  observe (data) {
    if (typeof data !== 'object' || data === null) {
      throw new Error('data type is wrong')
    }
    const depMap = this.deps
    proxy = new Proxy(data, {
      get (target, prop) {
        if (Dep.target) {
          depMap.get(prop).depend()
        }
        return target[prop]
      },
      set (target, prop, val) {
        if (!(prop in target)) {
          depMap.set(prop, new Dep())
          target[prop] = val
        } else if (target[prop] !== val) {
          target[prop] = val
          depMap.get(prop).notify()
        }
      },
      deleteProperty (target, prop) {
        if (prop in target) {
          delete target[prop]
          depMap.delete(prop)
        }
      }
    })
  }
}

class Watcher {
  constructor (obj, expr, cb) {
    this.cb = cb
    this.getter = typeof expr === 'function' ? expr : parsePath(obj, expr)
    this.value = this.get()
  }
  get () {
    Dep.target = this
    let value
    value = this.getter()
    Dep.target = null
    return value
  }
  update () {
    const value = this.get()
    if (value !== this.value) {
      const oldVal = this.value
      this.value = value
      this.cb.call(null, value, oldVal)
    }
  }
}

const observer = new Observer(obj)

const watcher = new Watcher(proxy, renderFn, null)

function parsePath (obj, expr) {
  return function () {
    const segments = expr.split('.')
    for (let i = 0; i < segments.length; i++) {
      if (!obj) {
        return
      }
      obj = obj[segments[i]]
    }
    return obj
  }
}

function renderFn () {
  const name = proxy[0]
  const age = proxy[1]
  console.log(`name is ${name} and age is ${age}`)
}

proxy[1] = 'tom'

function observe (value) {
  if (typeof value === 'object' && value !== null) {
    new Observer(value)
  }
}

function Observer (value) {
  if (! Array.isArray(value)) {
    this.data = value
    this.walk(value)
  }
}
Observer.prototype = {
  walk (value) {
    Object.keys(value).forEach(key => {
      this.defineReactive (value, key, value[key])
    })
  },
  defineReactive (obj,key,value) {
    let dep = new Dep()
    observe(value)
    Object.defineProperty(obj, key, {
      configurable:true,
      enumarable:true,
      get: function () {
        if (Dep.target) {
          dep.addSub(Dep.target)
        }
        // console.log('get data' + key + ' is ' + value)
        return value
      },
      set: function (newValue) {
        if (newValue === value) {
          return
        }
        value = newValue
        dep.notify()
      }
    })
  }
}

function Dep () {
  this.subs = []
}
Dep.prototype = {
  addSub (sub) {
    this.subs.push(sub)
  },
  notify () {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
Dep.target = null

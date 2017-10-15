function Compile (el, vm) {
  this.vm = vm
  this.el = document.querySelector(el)
  this.fragment = null
  this.init()
}

Compile.prototype = {
  compileElement (el) {
    let childNodes = el.childNodes;
    [].slice.call(childNodes).forEach(child => {
      let reg = /\{\{(.*)\}\}/
      let text = child.textContent
      if (this.isElementNode(child)) {
        this.compile(child)
      }
      if (this.isTextNode(child) && reg.test(text)) {
        this.compileText(child,reg.exec(text)[1])
      }
      if (child.childNodes && child.childNodes.length) {
        this.compileElement(child)
      }
    })
  },
  init () {
    if (this.el) {
      this.fragment = this.nodeToFragment(this.el)
      this.compileElement(this.fragment)
      this.el.appendChild(this.fragment)
    } else {
      console.log('DOM 元素不存在')
    }
  },
  compile (node) {
    [].forEach.call(node.attributes, attr => {
      let name = attr.name
      let val = attr.value
      if (this.isDirective(name)) {
        let directive = name.slice(2).split(':')[0]
        const directiveObj = {
          'on':this.compileEvent,
          'bind':this.compileBind,
          'model':this.compileModel
        }
        if(directive in directiveObj) {
          directiveObj[directive].call(this,this.vm, node, val, name.slice(2))
        }
        node.removeAttribute(name)
      }
    })
  },
  compileEvent (vm, node, val, name) {
    let eventType = name.split(':')[1]
    let cb = vm.methods && vm.methods[val]
    if (cb && eventType) {
      node.addEventListener(eventType, cb.bind(vm), false)
    }
  },
  compileBind (vm, node, val, name) {
    let attrVal = vm[val]
    let attrName = name.split(":")[1]
    if (attrName && attrVal) {
      node.setAttribute(attrName, attrVal)
    }
    new Watcher(vm, val, (value) => {node.setAttribute(attrName, value)})
  },
  compileModel (vm, node, val, name) {
    let value = vm[val];
    this.updateModelVal(node, value)
    new Watcher(vm, val, value => {this.updateModelVal(node, value)})
    node.addEventListener('input',(e) => {
      let value = e.target.value
      vm[val] = value
    }, false)
  },
  nodeToFragment (el) {
    let fragment = document.createDocumentFragment()
    let child = el.firstChild
    while (child) {
      fragment.appendChild(child)
      child = el.firstChild
    }
    return fragment
  },
  compileText (el, exp) {
    let initText = this.vm[exp]
    let self = this
    this.updateText(el, initText)
    new Watcher(this.vm, exp, (value) => {
      self.updateText(el, value)
    })
  },
  updateText (el, value) {
    el.textContent = typeof value === undefined ? '' : value
  },
  isTextNode (el) {
    return el.nodeType === 3
  },
  isElementNode (el) {
    return el.nodeType === 1
  },
  isDirective (attr) {
    return attr.indexOf('v-') === 0
  },
  updateModelVal(node, val) {
    node.value = typeof val === undefined ? '' : val
  }
}

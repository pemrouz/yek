module.exports = render
const { assign } = Object 
    , special = {
        $attributes: (node, state, i) => {
          for (attr in state[i])
            node.setAttribute(attr, state[i][attr])
        }
      }
    , copy = (node, state, i) => node[i] = node.state[i] = state[i]

function render(_node, state = {}, children){
  const node = _node.n || new Node(_node)

  if (typeof state == 'object') {
    for (let i in state) 
      (special[i] || copy)(node._node, state, i)
  } else if (typeof state == 'string') 
    node._node[node._node.nodeName == '#text' ? 'textContent' : 'innerHTML'] = state

  if (typeof children == 'function')
    return children(node._node, node._node.state), node
  else if (Array.isArray(children)) {    
    let i = -1
    while (++i < children.length) {
      if (!children[i]) {
        children.splice(i--, 1)
        continue
      }
      const [type, state = {}, grandchildren] = children[i]
          , child = i >= node.children.length     ? node.add(render(...children[i]))
                  : type == node.children[i].type ? render(node.children[i]._node, state, grandchildren)
                                                  : node.replace(render(...children[i]), i)

      if (child._node.render)
        child._node.render(child._node, child._node.state)
    }

    while (i < node.children.length) node.remove(i)
  }

  return node
}

function Node(_node) {
  this.children = []
  this._node = typeof _node == 'object' ? _node 
             : typeof _node == 'string' ? el(_node)
                                        : new _node()

  this.type  = typeof _node == 'object' ? _node.tagName.toLowerCase()
                                        : _node

  this._node.n = this
  this._node.state = this._node.state || {}
}

Node.prototype.add = function(node) {
  this.children.push(node)
  this._node.appendChild(node._node)
  return node
}

Node.prototype.remove = function(index) {
  const [node] = this.children.splice(index, 1)
  this._node.removeChild(node._node)
}

Node.prototype.replace = function(node, index){
  this._node.insertBefore(node._node, this.children[index]._node)
  this.children.splice(index, 0, node)
  this.remove(++index)
  return node
}

function el(selector){
  var attrs = []
    , css = selector.replace(/\[(.+?)(="(.*?)")?\]/g, ($1, $2, $3, $4 = '') => (attrs.push([$2, $4]), '')).split('.')
    , tag  = css.shift() || 'div'
    , elem = tag == 'text' ? document.createTextNode('') : document.createElement(tag)

  for (let d of attrs) elem.setAttribute(d[0], d[1]) 
  for (let d of css) elem.classList.add(d)
  return elem
}

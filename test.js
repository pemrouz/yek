const { test } = require('tap')
    , { spawn } = require('spawn-client')
    
test('basic', spawn(async () => {
  const render = await require('./')

  render(document.body, {}, [
    ['ul', {}, [
      ['li']
    , ['li']
    ]]
  ])

  same(document.body.innerHTML.trim(), `<ul><li></li><li></li></ul>`)
}))

test('basic - props', spawn(async () => {
  const render = await require('./')

  render(document.body, {}, [
    ['ul', {}, [
      ['li', { color: 'red' }]
    , ['li', { color: 'blue' }]
    ]]
  ])

  same(document.body.firstElementChild.firstElementChild.color, 'red')
  same(document.body.firstElementChild.lastElementChild.color, 'blue')
  same(document.body.firstElementChild.firstElementChild.state.color, 'red')
  same(document.body.firstElementChild.lastElementChild.state.color, 'blue')
}))

test('custom elements - classes', spawn(async () => {
  const yek = await require('./')

  class Parent extends HTMLElement {
    render(node, state){
      node.id = state.parent
    }
  }

  class Child extends HTMLElement {
    render(node, state){
      yek(node, {}, [
        ['label', `hey I'm ${state.child}`]
      ])
    }
  }

  customElements.define('x-parent', Parent)
  customElements.define('x-child', Child)

  yek(document.body, {}, [
    [Parent, { parent: 'foo' }, [
      [Child, { child: 'bar' }]
    ]]
  ])

  same(document.body.innerHTML.trim(), `<x-parent id="foo"><x-child><label>hey I'm bar</label></x-child></x-parent>`)
}))

test('custom elements - tags', spawn(async () => {
  const yek = await require('./')

  class Parent extends HTMLElement {
    render(node, state){
      node.id = state.parent
    }
  }

  class Child extends HTMLElement {
    render(node, state){
      yek(node, {}, [
        ['label', `hey I'm ${state.child}`]
      ])
    }
  }

  customElements.define('x-parent', Parent)
  customElements.define('x-child', Child)

  yek(document.body, {}, [
    ['x-parent', { parent: 'foo' }, [
      ['x-child', { child: 'bar' }]
    ]]
  ])

  same(document.body.innerHTML.trim(), `<x-parent id="foo"><x-child><label>hey I'm bar</label></x-child></x-parent>`)
}))
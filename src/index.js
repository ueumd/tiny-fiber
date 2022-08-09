import React, { render, Component } from './react'

const root = document.getElementById('root')

// 普通节点
const jsx = (
	<div className="app">
		<p>Hello React</p>
		<p>Hello Fiber</p>
	</div>
)

// 类组件
class Greating extends Component {
	constructor(props) {
		super(props)
	}
	render() {
		return <div>Hello {this.props.title}</div>
	}
}


function FuncComponent(props){
  return <div>{ props.title } FuncComponent</div>
}

// render(jsx, root)
render(<Greating title="奥利给" />, root)
// render(<FuncComponent title="hello" />, root)

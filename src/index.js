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
    this.state = {
      name: '张三'
    }
	}
	render() {
		return <div>
      Hello {this.props.title} {this.state.name}
      <button onClick={() => this.setState({name: '李四'})}>change name</button>
    </div>
	}
}


function FuncComponent(props){
  return <div>{ props.title } FuncComponent</div>
}

// render(jsx, root)
// render(<Greating title="奥利给" />, root)
// render(<FuncComponent title="hello" />, root)


// 更新节点
// render(jsx, root)
//
// setTimeout(() => {
//   const jsx = (
//     <div>
//       <div>奥利给</div>
//       <p>Hello Fiber</p>
//     </div>
//   )
//
//   render(jsx, root)
// }, 3000)


// 类组件状态更新
render(<Greating title="奥利给" />, root)

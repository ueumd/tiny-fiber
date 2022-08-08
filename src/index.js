import React, { render } from './react'

const root = document.getElementById('root')

const jsx = (
	<div className="app">
		<p>Hello React</p>
		<p>Hello Fiber</p>
	</div>
)

console.log('jsx', jsx)

render(jsx, root)

import React, { render } from './react'

const root = document.getElementById('root')

const jsx = (
	<div className="app">
		<p>Hello React</p>
		<p>Hello Fiber</p>
	</div>
)

console.log('jsx', jsx)

/**

 props: {
     children: [
        0: {type: 'p', props: {…}}
        1: {type: 'p', props: {…}}
     ]
     className: "app"
 }
 type: "div"

 */

render(jsx, root)

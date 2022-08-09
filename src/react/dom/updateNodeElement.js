/**
 * 为元素添加属性
 * @param newElement 创建好的 DOM元素对象 div
 * @param virtualDOM
 */
export default function updateNodeElement(newElement, virtualDOM, oldVirtualDOM = {}) {
	/**
   class
   props: {
    children: (9) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
    className: "container"
   }

   // event
   props: {
     children: [{…}]
     onClick: ƒ onClick()
   }
   */

	// 获取节点对应属性对象
	const newProps = virtualDOM.props || {}

	//  旧的属性对象
	const oldProps = oldVirtualDOM.props || {}

	// 文本节点
	if (virtualDOM.type === 'text') {
		if (newProps.textContent !== oldProps.textContent) {
      if (virtualDOM.parent.type !== oldVirtualDOM.parent.type) {
        // 父级节点不同 追加
        virtualDOM.parent.stateNode.appendChild(document.createTextNode(newProps.textContent))
      } else {
        // 不同 找到父级节点 替换
        virtualDOM.parent.stateNode.replaceChild(document.createTextNode(newProps.textContent), oldVirtualDOM.stateNode)
      }
    }
		return
	}

	Object.keys(newProps).forEach(propName => {
		// 获取属性值
		const newPropsValue = newProps[propName]
		const oldPropsValue = oldProps[propName]

		// 新值和旧值不相等 直接把新值更新上去
		if (newPropsValue !== oldPropsValue) {
			// 是否是事件属性 onClick -> click
			if (propName.slice(0, 2) === 'on') {
				const eventName = propName.toLowerCase().slice(2)

				// 元素添加事件
				// 	<button onClick={() => alert('你好')}>点击我</button>
				newElement.addEventListener(eventName, newPropsValue)

				// 删除原有的事件的事件处理函数
				if (oldPropsValue) {
					newElement.removeEventListener(eventName, oldPropsValue)
				}
			} else if (propName === 'value' || propName === 'checked') {
				newElement[propName] = newPropsValue
			} else if (propName !== 'children') {
				// 属性 className: "container"
				if (propName === 'className') {
					newElement.setAttribute('class', newPropsValue)
				} else {
					// 普通属性
					newElement.setAttribute(propName, newPropsValue)
				}
			}
		}
	})

	// 判断属性被删除的情况
	Object.keys(oldProps).forEach(propName => {
		const newPropsValue = newProps[propName]
		const oldPropsValue = oldProps[propName]
		if (!newPropsValue) {
			// 属性被删除了
			if (propName.slice(0, 2) === 'on') {
				const eventName = propName.toLowerCase().slice(2)
				newElement.removeEventListener(eventName, oldPropsValue)
			} else if (propName !== 'children') {
				newElement.removeAttribute(propName)
			}
		}
	})
}

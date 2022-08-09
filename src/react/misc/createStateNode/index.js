import { createDOMElement } from '../../dom'
import {createReactInstance } from '../createReactInstance'

const createStateNode = fiber => {
	// 普通节点
	if (fiber.tag === 'host_component') {
		// 创建DOM元素
		return createDOMElement(fiber)
	} else {
    return createReactInstance(fiber)
  }
}

export default createStateNode

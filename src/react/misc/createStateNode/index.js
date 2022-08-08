import { createDOMElement } from '../../dom'

const createStateNode = fiber => {
	// 普通节点
	if (fiber.tag === 'host_component') {
		// 创建DOM元素
		return createDOMElement(fiber)
	}
}

export default createStateNode

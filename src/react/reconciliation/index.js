import { createTaskQueue } from '../misc'
import arrified from '../misc/arrified'

// 任务队列
const taskQueue = createTaskQueue()

// 要执行的 任务
let subTask = null

/**
 * 从任务队中获取任务 并返回 fiber 对象
 */
const getFirstTask = () => {
	// 任务队列中的第1个任务
	const task = taskQueue.pop()
	console.log('task', task)

	// 返回最外层的 fiber 节点对象
	return {
		props: task.props,
		stateNode: task.dom,
		tag: 'host_root',
		effects: [],
		child: null
	}
}

/**
 * 构建子节点
 * @param fiber
 * @param children
 */
const reconcileChildren = (fiber, children) => {
	// children 可能是对象 也可能是数组
	// 将 children 转换成数组
	const arrifiedChildren = arrified(children)
	// console.log(arrifiedChildren)

	let index = 0
	let numberOFElements = arrifiedChildren.length
	let element = null

	let newFiber = null
  let prevFiber = null

	while (index < numberOFElements) {
		element = arrifiedChildren[index]
		// console.log(element)
		newFiber = {
			type: element.type,
			props: element.props,
			tag: 'host_component',
			effects: [],
			effectTag: 'placement',
			stateNode: null,
      parent: fiber
		}

    if (index === 0) {
      // 第一个子节点
      fiber.child = newFiber
    } else {
      prevFiber.sibling = newFiber
    }

    prevFiber = newFiber


		index++
	}
}

const executeTask = fiber => {
	reconcileChildren(fiber, fiber.props.children)
  console.log(fiber)
}

/**
 * 执行任务
 * @param deadline
 */
const workLoop = deadline => {
	// 第1次执行 肯定是没有任务的
	// 如果子任务不存在 就获取任务
	if (!subTask) {
		subTask = getFirstTask()
		console.log('subTask', subTask)
	}

	// 任务存在 并且 浏览器有空余有时间就调用 executeTask 方法执行任务
	// executeTask 要接收任务 还要返回新的任务
	while (subTask && deadline.timeRemaining() > 1) {
		// 返回新的任务
		subTask = executeTask(subTask)
	}
}

/**
 * 调度任务
 * @param deadline
 */
const performTask = deadline => {
	// 执行任务
	// 为什么加workLoop loop代表循环的意思，我们要把一个大的任务拆分成一个个小的任务
	// 一个个小任务就需要采用循环的方式来调用，所以把这个方法命名为workLoop
	workLoop(deadline)

	// 如果任务存在 则继续
	if (subTask || !taskQueue.isEmpty()) {
		requestIdleCallback(performTask)
	}
}

/**
 * render 方法 要做的事情
 * 1. 向任务队列中添加任务
 * 2. 指定在浏览空闲时执行任务
 *
 * 任务就是通过 vdom 对象 构建 fiber 对象
 *
 * @param element
 * @param dom => root
 */
export const render = (element, dom) => {
	// 1. 向任务队列中添加任务
	taskQueue.push({
		dom,
		props: { children: element }
	})

	// console.log(taskQueue.pop())

	// 指定在浏览器空闲的时间去执行任务
	requestIdleCallback(performTask)
}

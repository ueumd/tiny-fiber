import {createTaskQueue, createStateNode, getTag, getRoot} from '../misc'
import arrified from '../misc/arrified'
import { updateNodeElement } from '../dom'
import {instance} from "eslint-plugin-react/lib/util/lifecycleMethods";

/**

 Fiber 对象
 {
  type         节点类型 (元素, 文本, 组件)(具体的类型)
  props        节点属性
  stateNode    节点 DOM 对象 | 组件实例对象
  tag          节点标记 (对具体类型的分类 hostRoot || hostComponent || classComponent || functionComponent)
  effects      数组, 存储需要更改的 fiber 对象
  effectTag    当前 Fiber 要被执行的操作 (新增, 删除, 修改)
  parent       当前 Fiber 的父级 Fiber
  child        当前 Fiber 的子级 Fiber
  sibling      当前 Fiber 的下一个兄弟 Fiber
  alternate    当前Fiber 备份 fiber 比对时使用
}


 实现思路：
 在Fiber方案中， 为了实现任务的终止再继续，DOM对比算法 被分成了两部分
 1. 构建 Fiber (可中断)
 2. 提交 Commit (不可中断)

 DOM 初始化渲染：virtualDOM -> Fiber  -> Fiber[] -> DOM
 DOM   更新操作：newFiber vs oldFiber -> Fiber[] -> DOM

 */

// 任务队列
const taskQueue = createTaskQueue()

// 要执行的 任务
let subTask = null

// 等待并提交
let pendingCommit = null

/**
 * 提交阶段
 * @param fiber
 */
const commitAllWork = fiber => {
	// console.log(fiber.effects)

	// 循环 effects 数组 构建DOM节点树
	fiber.effects.forEach(item => {

    if(item.tag === 'class_component') {
      item.stateNode.__fiber = item
    }

		if (item.effectTag === 'delete') {
			// 找到父级删除子级
			item.parent.stateNode.removeChild(item.stateNode)
		}
		if (item.effectTag === 'update') {
			// 更新
			// 当前节点与备份节点类型相同
			if (item.type === item.alternate.type) {
				updateNodeElement(item.stateNode, item, item.alternate)
			} else {
				// 节点类型不同
				item.parent.stateNode.replaceChild(item.stateNode, item.alternate.stateNode)
			}
		}
		if (item.effectTag === 'placement') {
			// 当前要追加的节点
			let fiber = item

			// 当前要追加的子级节点的父级
			let parentFiber = item.parent

			// 找到普通节点父级 排除组件父级
			// 因为组件级是不能直接追加真实DOM节点的
			while (parentFiber.tag === 'class_component' || parentFiber.tag === 'function_component') {
				parentFiber = parentFiber.parent
			}
			if (fiber.tag === 'host_component') {
				parentFiber.stateNode.appendChild(fiber.stateNode)
			}
		}
	})

	// 在根节点 备份旧的 fiber 节点对象
	fiber.stateNode._rootFiberContaner = fiber
}

/**
 * 从任务队中获取任务 并返回 fiber 对象
 */
const getFirstTask = () => {
	// 任务队列中的第1个任务
	const task = taskQueue.pop()
	// console.log('task', task)

  // 任务是类组件状态更新
  if(task.from === 'class_component') {
   //  task.instance.__fiber
    const root = getRoot(task.instance)
    console.log(root)
    task.instance.__fiber.partialState = task.partialState
    return {
      props: root.props,
      stateNode: root.stateNode,
      tag: 'host_root',
      effects: [],
      child: null,
      alternate: root
    }
  }

	// 返回最外层的 Fiber 节点对象
	return {
		props: task.props,
		stateNode: task.dom,
		tag: 'host_root',
		effects: [],
		child: null,
		alternate: task.dom._rootFiberContaner
	}
}

/**
 * 构建子结节 fiber 对象
 * @param fiber
 * @param children 所有子级节点
 */
const reconcileChildren = (fiber, children) => {
	// console.log(children)
	// children 可能是对象 也可能是数组
	// 将 children 转换成数组
	const arrifiedChildren = arrified(children)
	// console.log(arrifiedChildren)

	let index = 0
	let numberOFElements = arrifiedChildren.length
	let element = null
	let newFiber = null
	// 上一个节点
	let prevFiber = null
	let alternate = null

	// children 数组中第1个子节点
	if (fiber.alternate && fiber.alternate.child) {
		alternate = fiber.alternate.child
	}

	while (index < numberOFElements || alternate) {
		element = arrifiedChildren[index]
		// console.log(element)

		// element 不存在 子结节备份存在 删除
		if (!element && alternate) {
			// 删除操作
			alternate.effectTag = 'delete'
			fiber.effects.push(alternate)
		}

    if (element && alternate) {
			// 更新
			newFiber = {
				type: element.type,
				props: element.props,
				tag: getTag(element),
				effects: [],
				effectTag: 'update',
				stateNode: null,
				parent: fiber,
				alternate
			}

			if (element.type === alternate.type) {
				// 类型相同
				newFiber.stateNode = alternate.stateNode
			} else {
				// 存储当前节点的DOM对象
				// 如果类组件 则是当前节点对象的实例
				newFiber.stateNode = createStateNode(newFiber)
			}
		} else if (element && !alternate) {
			// 初始渲染
			// 子级fiber对象
			newFiber = {
				type: element.type,
				props: element.props,
				tag: getTag(element),
				effects: [],
				effectTag: 'placement',
				// stateNode: null,
				parent: fiber // 当前节点的父级
			}

			// 存储当前节点的DOM对象
			// 如果类组件 则是当前节点对象的实例
			newFiber.stateNode = createStateNode(newFiber)
			// console.log('newFiber', newFiber)
		}

		// 为父级 fiber 添加 子级 fiber
		if (index === 0) {
			// 第1个节点的子节点
			// 当前节点的子结点
			fiber.child = newFiber
		} else if (element) {
			// 为fiber 添加一下个兄弟 fiber
			prevFiber.sibling = newFiber
		}

		if (alternate && alternate.sibling) {
			alternate = alternate.sibling
		} else {
      alternate = null
    }

		prevFiber = newFiber

		index++
	}
}

/**
 * 执行任务 并构建子级fiber对象
 * @param fiber
 * @returns {null|*}
 */
const executeTask = fiber => {
	// console.log(fiber)

	// 构建子级Fiber对象
	// virtualDOM -> fiber.props.children

	// fiber 当前Fiber对象 (根节点)
	// fiber.props.children (子节点)

	if (fiber.tag === 'class_component') {

    // 在render之前更新状态
    if(fiber.stateNode.__fiber && fiber.stateNode.__fiber.partialState) {
      fiber.stateNode.state = {
        ...fiber.stateNode.state,
        ...fiber.stateNode.__fiber.partialState
      }
    }

    // 渲染
		reconcileChildren(fiber, fiber.stateNode.render())
	} else if (fiber.tag === 'function_component') {
		reconcileChildren(fiber, fiber.stateNode(fiber.props))
	} else {
		// 普通节点
		reconcileChildren(fiber, fiber.props.children)
	}

	// 如果有子级 返回子级
	// 左侧节点
	if (fiber.child) {
		return fiber.child
	}

	/**
	 * 1. 如果存在同级 返回同级 构建同级的子级
	 * 2. 如果同级不存在 返回到父级 看父级是否有同级
	 */

	// 找出其他所有节点 构建fiber对象
	// 将这个子级当做父级 构建这个父级下的子级
	let currentExecuteFiber = fiber

	// 查找所有节点
	// 从底部查找到根节点 倒着查找
	while (currentExecuteFiber.parent) {
		// 把所有的fiber对象 存在最外层节点(id=root)对象的effects数组中
		// 最外层的 effects 数组中就有所有的fiber对象
		currentExecuteFiber.parent.effects = currentExecuteFiber.parent.effects.concat(
			// 数组进行合并
			currentExecuteFiber.effects.concat([currentExecuteFiber])
		)

		// 1. 如果存在同级 返回同级 构建同级的子级
		if (currentExecuteFiber.sibling) {
			return currentExecuteFiber.sibling
		}
		// 2. 如果同级不存在 返回到父级 看父级是否有同级
		currentExecuteFiber = currentExecuteFiber.parent
	}

	// 说明已经执行完
	pendingCommit = currentExecuteFiber
	console.log(currentExecuteFiber) // 最外层id=root
	console.log(fiber)
}

/**
 * 执行任务
 * @param deadline
 */
const workLoop = deadline => {
	// 如果子任务不存在 就获取任务
	if (!subTask) {
		// 第1次执行 肯定是没有任务的
		subTask = getFirstTask()
		console.log('subTask', subTask)
	}

	// 任务存在 并且 浏览器有空余有时间就调用 executeTask 方法执行任务
	// executeTask 要接收任务 还要返回新的任务
	while (subTask && deadline.timeRemaining() > 1) {
		// 返回新的任务
		subTask = executeTask(subTask)
	}

	if (pendingCommit) {
		// 执行第2阶段
		commitAllWork(pendingCommit)
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

   props: {
       children: [
          0: {type: 'p', props: {…}}
          1: {type: 'p', props: {…}}
       ]
       className: "app"
   }
   type: "div"

 * @param dom =>  <div id="root"></div>
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

export const scheduleUpdate = (instance, partialState) => {
  taskQueue.push({
    from: 'class_component',
    instance,
    partialState
  })
  requestIdleCallback(performTask)
}

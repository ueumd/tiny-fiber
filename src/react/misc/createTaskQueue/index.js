/**
 * 任务队例
 * @returns {{pop: (function(): *), push: (function(*): number)}}
 */
const createTaskQueue = () => {
	// 先进先出
	const taskQueue = []

	return {
    // 向任务队列中添加任务
		push: item => taskQueue.push(item),

    // 从任务队列中取出任务
		pop: () => taskQueue.shift(),

    // 判断任务队列中是否还有任务
    isEmpty: () => taskQueue.length === 0
	}
}

export default createTaskQueue


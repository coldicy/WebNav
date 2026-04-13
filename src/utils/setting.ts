//// README 封装一些 localstorage的读写 某些数据的 操作

//// item key for localStorage
const KEY_ENGINE_NAME: string = 'engine_name'
const KEY_ONE_THING: string = 'one_thing'

/* //// 搜索引擎的名字 的 存取 */
export const getEngineName = () : string => {
    const res: string = localStorage.getItem(KEY_ENGINE_NAME) || '百度' // 没有的话 默认给 百度
    return res
}

export const setEngineName = (engineName: string) : void => {
  localStorage.setItem(KEY_ENGINE_NAME, engineName)
}


/* //// 保存OneThing组件的内容 */
export const getOneThing = (): string => {
  return localStorage.getItem(KEY_ONE_THING) || ''
}

export const setOneThing = (thing: string): void => {
  localStorage.setItem(KEY_ONE_THING, thing)
}
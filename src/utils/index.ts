export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url.trim())
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

export function safeOpenUrl(url: string): void {
  if (!validateUrl(url)) {
    console.warn('非法链接已拦截:', url)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

// 只要obj1中的属性 和 obj2的对应属性的值相等 哪怕obj2有更多的属性 都返回true
export function deepEqualObj1(obj1: any, obj2: any): boolean {
  // 处理基本类型和引用相同的情况
  if (obj1 === obj2) return true;

  // 如果是字符串数据 使用trim比较
  if (typeof obj1 === 'string' && typeof obj2 === 'string') return obj1.trim() === obj2.trim()

  // 如果有一个不是对象或为 null，返回 false
  if (typeof obj1 !== 'object' || obj1 === null ||
      typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  // 获取对象1的所有键
  const keys1 = Object.keys(obj1);

  for (let key of keys1) {
    // 递归比较每一个属性值
    if (!deepEqualObj1(obj1[key], obj2[key])) return false;
  }

  return true;
}

/* 下面这段代码用于保存数据到localstorage，现在改用了后端express和sqlite，已经不需要了 */ 

// const DATA_VERSION = 'v1'
// const STORAGE_KEY_PREFIX = `web_nav_data_${DATA_VERSION}_`
// export function getStorageKey(userId: string): string {
//   return `${STORAGE_KEY_PREFIX}${userId}`
// }
// export function saveData(userId: string, data: any): void {
//   localStorage.setItem(getStorageKey(userId), JSON.stringify(data))
// }
// export function loadData(userId: string): any {
//   const raw = localStorage.getItem(getStorageKey(userId))
//   return raw ? JSON.parse(raw) : null
// }
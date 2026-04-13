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
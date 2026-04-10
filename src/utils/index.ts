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

const STORAGE_KEY = 'web_nav_data_v1'
export function saveData(data: any): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
export function loadData(): any {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}
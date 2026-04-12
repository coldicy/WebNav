const CACHE_KEY = 'nav_icon_cache_v1'
const MAX_CACHE_ITEMS = 100
const CACHE_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000 //七天过期

export interface CachedIcon {
  base64: string
  timestamp: number
}

// 获取完整缓存对象
function getCache(): Record<string, CachedIcon> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

// 读取缓存图标
export function getCachedIcon(domain: string): string | null {
  const cache = getCache()
  const item = cache[domain]
  if (!item) return null

  // 检查是否过期
  if (Date.now() - item.timestamp > CACHE_EXPIRE_MS) {
    delete cache[domain]
    sync(cache)
    return null
  }

  return item.base64
}

// 写入缓存 清理超出数量的缓存
export function cacheIcon(domain: string, base64: string): void {
  try {
    const cache = getCache()

    // 跟新或新增
    cache[domain] = {base64, timestamp: Date.now()}

    // 按时间戳排序，保留最新的 MAX_CACHE_ITEMS个
    const entries = Object.entries(cache)
    if (entries.length > MAX_CACHE_ITEMS) {
      entries.sort((a, b) => {
        return -(a[1].timestamp - b[1].timestamp)
      })
      const toRemove = entries.slice(MAX_CACHE_ITEMS)
      toRemove.forEach(([domain]) => {
        delete cache[domain]
      })
    }

    // 写入本地缓存
    sync(cache)

  } catch (error) {
    // 捕获 QuotaExceededError(空间不足)，自动清空缓存并提示
    console.warn("图标缓存空间不足，自动清理旧数据: ", error)
    clearIconCache()
  }
}

// 根据域名删除某个缓存
export function deleteCachedIcon(domain: string): void {
  const cache = getCache()
  if (cache[domain]) {
    delete cache[domain]
  }
  sync(cache)
}

// 清空缓存
export function clearIconCache(): void {
  localStorage.removeItem(CACHE_KEY)
  console.log('图标缓存已清空')
}


// 同步数据
function sync(cache: Record<string, CachedIcon>): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}
// 从url中提取域名  http://www.baidu.com/a/b/c -> www.baidu.com
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.trim())
    return urlObj.hostname
  } catch {
    return ''
  }
}

// 获取网站图标URL 
export function getFaviconUrl(domain: string, size: number = 64): string {
  if (!domain) return '/favicon.ico'

  // 返回结果url
  let resIconUrl = ''

  const iconHorseUrl = `https://icon.horse/icon/${domain}`
  // faviconKit 支持尺寸 16 32 48 64 128
  const faviconKitUrl = `https://api.faviconkit.com/${domain}/${size}`
  // google favicon api
  const googleIconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`

  resIconUrl = iconHorseUrl

  return resIconUrl
}

// 生成图标加载失败时 返回首字母 + 颜色色背景
export function getIconFallback(title: string): {text: string; color: string} {
  // 颜色集合
  const colors = [
    '#409EFF', // 蓝
    '#67C23A', // 绿
    '#E6A23C', // 橙
    '#F56C6C', // 红
    '#909399', // 灰
    '#8582F7', // 紫
    '#5BC1DE', // 青
    '#DE8C5B'  // 棕
  ]

  // 用标题的字符码总和 作为索引 保证相同标题 颜色一致
  const hash = title.split('').reduce((preRes, value, index, array) => {
    return preRes + value.charCodeAt(0)
  }, 0)
  const color = colors[hash % colors.length]

  // 标题首字
  const firstChar = title.charAt(0).toUpperCase()
  return {text: firstChar, color}
}
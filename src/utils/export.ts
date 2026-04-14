import { NavGroup } from "@/types";

export interface BackupData {
  version: string
  timestamp: number
  groups: NavGroup[]
}

// 导出数据 json
export function exportNavData(groups: NavGroup[]): void {
  const backup: BackupData = {
    version: '1.0',
    timestamp: Date.now(),
    groups: JSON.parse(JSON.stringify(groups))  //深拷贝
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'})
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `web-nav-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 导入json
export async function importNavData(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        // 验证数据结构
        if (!data.groups || !Array.isArray(data.groups)) {
          reject(new Error('无效的备份文件格式'))
          return
        }
        
        resolve(data)
      } catch (error) {
        reject(new Error('JSON 解析失败，文件可能已损坏'))
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}
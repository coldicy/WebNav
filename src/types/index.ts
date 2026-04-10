export interface NavItem {
  id: string
  title: string
  url: string
  icon?: string
  description?: string
  order: number
}

export interface NavGroup {
  id: string
  name: string
  items: NavItem[]
  order: number
}
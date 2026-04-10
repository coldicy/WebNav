import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NavGroup, NavItem } from '@/types'
import { generateId, saveData, loadData } from '@/utils'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'
import { watch } from 'vue'

export const useNavStore = defineStore('nav', () => {
  // 用户身份状态管理 
  const authStore = useAuthStore()
  // 所有 导航分组
  const groups = ref<NavGroup[]>([])

  // 初始化加载
  loadUserData()

  // 根据用户来加载导航分组
  function loadUserData(): void {
    if (authStore.currentUser) {
      const data = loadData(authStore.currentUser)
      groups.value = data?.groups || []
    } else {
      ElMessage.error('当前未登录，页面刷新时数据将丢失')
      groups.value = []
    }
  }

  function addGroup(name = '未命名分组') {
    const finalName = name.trim() || '未命名分组'
    const nameExists = groups.value.find((group) => group.name === finalName)
    if (nameExists) {
      ElMessage.warning('该分组已存在');
      return
    } 
    groups.value.push({
      id: generateId(),
      name: finalName,
      items: [],
      order: groups.value.length
    })
    sync()
  }

  function updateGroupName(groupId: string, newName: string) {
    
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      const nameExists = groups.value.find((g) => {
        return g.name === newName.trim()
      })
      if (nameExists) {
        ElMessage.warning('该分组名已存在')
        return
      }
      // 防御性处理 去空格 + 空值兜底
      group.name = newName.trim() || '未命名分组'
      sync()
    }
  }

  function addItem(groupId: string, item: Omit<NavItem, 'id' | 'order'>) {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    group.items.push({ ...item, id: generateId(), order: group.items.length })
    sync()
  }

  function updateGroupOrder(newGroups: NavGroup[]) {
    groups.value = newGroups.map((g, i) => ({ ...g, order: i }))
    sync()
  }

  function updateItemOrder(groupId: string, newItems: NavItem[]) {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      group.items = newItems.map((item, i) => ({ ...item, order: i }))
      sync()
    }
  }

  function removeGroup(groupId: string) {
    groups.value = groups.value.filter(g => g.id !== groupId)
    sync()
  }

  // 更新单个nav item
  function updateItem(groupId: string, itemId: string, updates: Partial<NavItem>) {
    const group = groups.value.find((g) => {
      return g.id === groupId
    })
    if (!group) return
    const item = group.items.find((i) => {
      return i.id === itemId
    })
    if (item) {
      // 合并对象修改字段
      Object.assign(item, updates)
      sync()
    }
  }

  // 删除单个navitem
  function removeItem(groupId: string, itemId: string) {
    const group = groups.value.find((g) => {
      return g.id === groupId
    })
    if (!group) return
    group.items = group.items.filter((item) => {
      return item.id !== itemId
    })
    sync()
  }

  function sync() {
    if (authStore.currentUser) {
      saveData(authStore.currentUser, { groups: groups.value })
    } 
  }

  /* 监听数据变化 */
  ////
  // 监听 currentUser 数据变化，变化自动重新加载导航数据
  watch(() => authStore.currentUser, () => {
    loadUserData()
  })

  return { groups, addGroup, addItem, updateGroupOrder, updateItemOrder, 
    removeGroup, updateGroupName, updateItem, removeItem }
})
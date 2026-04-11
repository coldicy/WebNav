import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NavGroup, NavItem } from '@/types'
import { generateId, saveData, loadData } from '@/utils'  //添加后端和sqlite后，已经用不上这两个加载 和 保存数据的方法了，他们是使用localstorage实现的
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'
import { watch } from 'vue'
import { navApi } from '@/api'

export const useNavStore = defineStore('nav', () => {
  // 用户身份状态管理 
  const authStore = useAuthStore()
  // 所有 导航分组
  const groups = ref<NavGroup[]>([])

  // 初始化加载
  loadUserData()

  // 根据用户来加载导航分组
  async function loadUserData() {
    if (authStore.currentUser) {
      try {
        const res = await navApi.getData(authStore.currentUser)
        const data = res.data
        groups.value = data?.groups || []
      } catch (e: any) {
        ElMessage.error( e.message || `请求${authStore.currentUser}的导航数据失败`)
        groups.value = []
      }
    } else {
      ElMessage.error('当前未登录，页面刷新时数据将丢失')
      groups.value = []
    }
  }

  async function addGroup(name = '未命名分组') {
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

  async function updateGroupName(groupId: string, newName: string) {
    
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

  async function addItem(groupId: string, item: Omit<NavItem, 'id' | 'order'>) {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    group.items.push({ ...item, id: generateId(), order: group.items.length })
    sync()
  }

  async function updateGroupOrder(newGroups: NavGroup[]) {
    groups.value = newGroups.map((g, i) => ({ ...g, order: i }))
    sync()
  }

  async function updateItemOrder(groupId: string, newItems: NavItem[]) {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      group.items = newItems.map((item, i) => ({ ...item, order: i }))
      sync()
    }
  }

  async function removeGroup(groupId: string) {
    groups.value = groups.value.filter(g => g.id !== groupId)
    sync()
  }

  // 更新单个nav item
  async function updateItem(groupId: string, itemId: string, updates: Partial<NavItem>) {
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
  async function removeItem(groupId: string, itemId: string) {
    const group = groups.value.find((g) => {
      return g.id === groupId
    })
    if (!group) return
    group.items = group.items.filter((item) => {
      return item.id !== itemId
    })
    sync()
  }

  async function sync() {
    if (authStore.currentUser) {
      try {
        await navApi.saveData(authStore.currentUser, {groups: groups.value})
      } catch (err: any) {
        ElMessage.error( err.message || '保存导航数据失败，请检查网络环境')
      }
    } 
  }

  /* 监听数据变化 */
  ////
  // 监听 currentUser 数据变化，变化自动重新加载导航数据
  watch(() => authStore.currentUser, async (newVal) => {
    console.log('监听到authStore.currentUser 发生变化，变化成', newVal)
    loadUserData()
  })

  return { groups, addGroup, addItem, updateGroupOrder, updateItemOrder, 
    removeGroup, updateGroupName, updateItem, removeItem }
})
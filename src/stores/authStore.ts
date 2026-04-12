import { defineStore } from "pinia";
import { ref, computed } from 'vue'
import { authApi } from "@/api";

const VERSION = 'v1'
const USERS_KEY = 'web_nav_auth_users_' + VERSION
const CURRENT_USER_KEY = 'web_nav_auth_current_' + VERSION

export const useAuthStore = defineStore('auth', () => {
  // 1. 从本地读取历史用户列表 和 当前登录用户
  const users = ref<Array<{username: string, password: string}>>([])
  users.value = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  const currentUser = ref<string | null>(localStorage.getItem(CURRENT_USER_KEY))

  // 2. 检查是否已登录
  const isLogined = computed(() => !!currentUser.value)

  // 登录
  async function login(username: string, password: string) {
    try {
      const res = await authApi.login(username, password)
      currentUser.value = res.username
      // 虽然已经引入了后端和数据库，但是仍在浏览器中缓存 当前登录用户的名字
      localStorage.setItem(CURRENT_USER_KEY, res.username)
      console.log('authStore.ts login(): 登录成功')
      return true
    } catch (error: any) {
      if (error instanceof Error) {
        throw error // 抛出原始错误
      }
      throw new Error(String(error || '登录失败'))
    }
  }

  // 注册
  async function register(username: string, password: string) {
    try {
      await authApi.register(username, password)
      // 注册后自动登录
      await login(username, password)
      return true
    } catch (error: any) {
      if (error instanceof Error) {
        throw error //抛出原始错误
      }
      throw new Error(String(error || '注册失败'))
    }
  }

  // 退出登录
  function logout(): void {
    currentUser.value = null
    localStorage.removeItem(CURRENT_USER_KEY)
    // 清空内存中的导航数据 防止切换用户时 数据污染
    window.location.reload()
  }





  return {
    currentUser,
    isLogined,
    users,
    login,
    register,
    logout
  }
})
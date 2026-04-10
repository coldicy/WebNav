import { defineStore } from "pinia";
import { ref, computed } from 'vue'

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
  function login(username: string, password: string): boolean {
    const user = users.value.find((u) => {
      return u.username === username && u.password === password
    })
    if (user) {
      currentUser.value = username
      // 保存当前用户
      localStorage.setItem(CURRENT_USER_KEY, username)
      return true
    }
    return false
  }

  // 注册
  function register(username: string, password: string): boolean {
    // 检查是否存在此用户
    const ifExsit = users.value.some((u) => {
      return u.username === username
    })
    if (ifExsit) {
      console.log('注册用户已存在')
      return false
    }
    // 如果不存在用户 就保存账户密码
    users.value.push({username, password})
    localStorage.setItem(USERS_KEY, JSON.stringify(users.value))
    // 注册成功 自动登录
    login(username, password)

    return true
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
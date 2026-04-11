import { RequestError } from "@/error/RequestError"

const API_BASE = 'http://localhost:3000/api'

async function request(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {'Content-Type': 'application/json'},
    ...options
  })
  const data = await res.json()
  // 如果 status 状态码不在200-299之内 那么就是不ok，则会抛出错误
  if (!res.ok) {
    console.log('request() not ok')
    throw new RequestError(data.error || '请求失败')
  } 
  return data
}

export const authApi = {
  register: (username: string, password: string) => {
    return request('/auth/register', {method: 'POST', body: JSON.stringify({username, password})})
  },

  login: (username: string, password: string) => {
    return request('/auth/login', {method: 'POST', body: JSON.stringify({username, password})})
  }

}

export const navApi = {
  getData: (username: string) => request(`/nav/${username}`),
  saveData: (username: string, data: any) => {
    return request(`/nav/${username}`, { method: 'POST', body: JSON.stringify(data) })
  }
}
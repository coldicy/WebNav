# WebNav 🧭

> 一个基于 Vue 3 + TypeScript + Vite 构建的个人导航网站，支持用户系统、数据同步、拖拽排序和暗色模式。

[![Vue 3](https://img.shields.io/badge/Vue-3.5+-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ 功能特性

- 🔐 **用户系统**：支持注册/登录，数据按用户隔离存储
- 🗂️ **导航管理**：分组管理网站链接，支持添加、编辑、删除
- 🎨 **图标自动获取**：自动抓取网站 favicon 并缓存，提升加载速度
- 🖱️ **拖拽排序**：支持导航项和分组的拖拽排序，个性化布局
- 🌙 **暗色模式**：内置暗色主题，支持一键切换
- ☁️ **数据同步**：基于 SQLite 的后端服务，支持多端数据同步
- 🐳 **Docker 部署**：提供 Dockerfile，一键容器化部署
- 📱 **响应式设计**：适配桌面端和移动端设备

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm / pnpm / yarn
- （可选）Docker >= 20.10

### 方式一：本地开发

```bash
# 1. 克隆项目
git clone git@github.com:coldicy/WebNav.git
cd WebNav

# 2. 安装依赖
npm install

# 3. 启动前端开发服务器
npm run dev

# 4. 启动后端服务（新终端）
npm run server
```

> 前端默认访问：`http://localhost:5173`  
> 后端 API 默认端口：`3000`

### 方式二：生产构建

```bash
# 1. 构建前端
npm run build

# 2. 启动服务
npm run server
```

### 方式三：Docker 部署

```bash
# 1. 构建镜像
docker build -t webnav .

# 2. 运行容器
docker run -d \
  -p 3000:3000 \
  -v ./data:/app/data \
  --name webnav \
  webnav
```

> 💡 数据卷挂载 `/app/data` 可持久化 SQLite 数据库

---

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 后端服务端口 | `3000` |
| `DB_PATH` | SQLite 数据库路径 | `./data/data.db` |

### 项目结构

```
WebNav/
├── src/
│   ├── api/          # API 请求封装
│   ├── components/   # 公共组件
│   ├── stores/       # Pinia 状态管理
│   ├── views/        # 页面视图
│   ├── App.vue       # 根组件
│   └── main.ts       # 应用入口
├── public/           # 静态资源
├── server.js         # Express 后端服务
├── vite.config.ts    # Vite 配置
├── tsconfig.json     # TypeScript 配置
├── Dockerfile        # Docker 构建文件
└── package.json      # 项目依赖
```

---

## 🔧 技术栈

### 前端
- 🎯 Vue 3 + `<script setup>` + Composition API
- 📘 TypeScript 类型支持
- ⚡ Vite 构建工具
- 🎨 Element Plus 组件库
- 🗃️ Pinia 状态管理
- 🔄 VueUse 工具库
- 🧩 vuedraggable 拖拽支持

### 后端
- 🚀 Express 框架
- 🗄️ better-sqlite3 嵌入式数据库
- 🔐 bcryptjs 密码加密
- 🌐 CORS 跨域支持

---

## 📦 API 接口

### 用户认证

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| POST | `/api/auth/register` | 用户注册 | `{username, password}` |
| POST | `/api/auth/login` | 用户登录 | `{username, password}` |

### 导航数据

| 方法 | 路径 | 说明 | 参数/请求体 |
|------|------|------|------------|
| GET | `/api/nav/:username` | 获取用户导航数据 | - |
| POST | `/api/nav/:username` | 保存用户导航数据 | `{groups: [...]}` |

> 📋 导航数据格式示例：
```json
{
  "groups": [
    {
      "id": "1",
      "name": "常用工具",
      "items": [
        {
          "id": "101",
          "title": "GitHub",
          "url": "https://github.com",
          "icon": "https://github.com/favicon.ico"
        }
      ]
    }
  ]
}
```

---


## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议，欢迎自由使用和二次开发。

---

## ⭐️ 支持项目

如果这个项目对你有帮助，欢迎点个 Star 支持！🌟




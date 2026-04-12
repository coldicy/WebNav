import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

import {ip} from 'address'
import {fileURLToPath} from 'url'
import path from 'path'
import fs from 'fs'

//所在文件夹目录
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const server = express()
// 监听端口号
const PORT = 3000

// 基础功能组件
server.use(cors())  //允许前端跨域请求
server.use(express.json()) // 解析json请求体
// vue构建的静态文件
server.use(express.static(path.join(__dirname, 'dist')))

// 数据库地址
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'data.db')
console.log('数据库地址是:', DB_PATH)
// 确保路径存在
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  console.log('创建数据库目录成功: ', path.dirname(DB_PATH))
}
// 初始化 sqlite数据库
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL') // 提升并发

// 创建用户表 和 导航数据表
db.exec(`
  create table if not exists users (
    id integer primary key autoincrement,
    username text unique not null,
    password text not null
  );
  create table if not exists nav_data (
    user_id integer primary key,
    json_data text not null default '{}',
    foreign key(user_id) references users(id) on delete cascade
  );
  `)

//// 路由
// 注册
server.post('/api/auth/register', (req, res) => {
  const {username, password} = req.body
  if (!username || !password) {
    return res.status(400).json({error: '参数不完整'})
  }
  
  try {
    // 密码哈希加密
    const hashedPassword = bcrypt.hashSync(password)
    const stmt = db.prepare('insert into users (username, password) values (?, ?)')
    stmt.run(username, hashedPassword)
    res.json({success: true, message: '注册成功'})
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(400).json({error: '用户名已存在'})
    } else {
      res.status(500).json({error: '服务器错误'})
    }
  }
})

//登录
server.post('/api/auth/login', (req, res) => {
  const {username, password} = req.body
  const user = db.prepare('select * from users where username = ?').get(username)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({error: '用户名或密码错误'})
  }
  res.json({success: true, username: user.username})
})

// 获取导航数据
server.get('/api/nav/:username', (req, res) => {
  const {username} = req.params
  const user = db.prepare('select * from users where username = ?').get(username)
  if (!user) return res.status(404).json({error: '用户不存在'})
  
  const nav = db.prepare('select json_data from nav_data where user_id = ?').get(user.id)
  res.json({data: nav ? JSON.parse(nav.json_data) : {groups: []}})
})

// 保存导航数据
server.post('/api/nav/:username', (req, res) => {
  const {username} = req.params
  const {groups} = req.body
  const user = db.prepare('select * from users where username = ?').get(username)
  if (!user) {
    return res.status(404).json({error: '用户不存在'})
  }
  const jsonStr = JSON.stringify({groups})
  db.prepare(`
    insert into nav_data (user_id, json_data) values (?, ?)
    on conflict(user_id) do update set json_data = excluded.json_data
    `).run(user.id, jsonStr)
  
  res.json({success: true})
})

// 默认路由 捕获所有未匹配的路径
server.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 启动服务
server.listen(PORT, '0.0.0.0', () => {
  console.log('local: http://localhost:'+PORT)
  console.log(`network: http://${ip()}:`+PORT)
})

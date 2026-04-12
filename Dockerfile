# ================= 阶段 1：构建前端 =================
FROM node:20-slim AS frontend-builder
WORKDIR /app
# 先复制 package 文件，利用 Docker 缓存层加速
COPY package*.json ./
RUN npm ci
# 复制源码并构建
COPY . .
RUN npm run build

# ================= 阶段 2：运行后端 =================
FROM node:20-slim AS production
WORKDIR /app

# 安装生产后端依赖
COPY package*.json ./
RUN npm ci --omit=dev

# 复制后端入口和前端构建产物
COPY server.js ./
COPY --from=frontend-builder /app/dist ./dist

# 创建数据目录
RUN mkdir -p /app/data

# 设置环境变量
# 存储数据库文件所在地址
ENV DB_PATH=/app/data/nav.db

EXPOSE 3000
CMD ["node", "server.js"]
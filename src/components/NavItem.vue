<template>
  <!-- 鼠标放在导航卡片上 如果是编辑模式 展示操作栏 离开则不显示 -->
  <div class="nav-item-wrapper" @mouseenter="stateStore.gStateEditMode ? showActions = true : showActions = false" @mouseleave="showActions = false">
    <!-- 卡片样式 -->
    <el-tooltip :content="item.url" placement="bottom" :disabled="!item.url">
      <div class="nav-item" @click="handleClick">
        <div class="content">
          <div class="icon-wrapper">
            <!-- 主图标: 自动加载 -->
            <img 
              :src="faviconUrl"
              :alt="item.title"
              class="site-icon"
              @error="handleIconError"
              @load="handleIconLoaded"  
              v-show="!iconError"
              crossorigin="anonymous"
            />
            <!-- 上面图标加载失败后显示 -->
            <div 
              v-if="iconError"
              class="fallback-icon"
              :style="{backgroundColor: fallbackIcon.color}"
            >
              {{ fallbackIcon.text }}
            </div>
          </div>
          <div class="info">
            <h4>{{ item.title }}</h4>
            <h6>{{ item.description }}</h6>
          </div>
        </div>
      </div>
    </el-tooltip>

    <!-- 悬浮操作按钮 -->
    <div class="actions" v-show="showActions">
      <!-- @click.stop 阻止事件冒泡；因为点击编辑按钮时 事件会冒泡到 外层如 el-card, 触发@click="handleClick" -->
      <el-button circle size="small" type='primary' @click.stop="openEditDialog" title="编辑">
        <el-icon><Edit /></el-icon>
      </el-button>
      <el-button circle size="small" type="danger" @click.stop="handleDelete" title="删除">
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑导航"
      width="420px"
      :close-on-click-modal="true"
      @close="resetForm"
      @opened="autoFocusFirstInput"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="top"
        @submit.prevent="submitEdit"
      >
        <el-form-item label="网站名称" prop="title">
          <el-input ref="firstFormInputRef" v-model="form.title" placeholder="请输入网站标题" clearable maxlength="20" show-word-limit/>
        </el-form-item>
        <el-form-item label="网站地址" prop="url">
          <el-input v-model="form.url" placeholder="请输入网站地址" clearable />
        </el-form-item>
        <el-form-item label="网站图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标地址" clearable />
        </el-form-item>
        <el-form-item label="网站描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入网站简介，鼠标悬停时显示" clearable />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="isSubmitting">确定</el-button>
      </template>
    </el-dialog>

  </div>

</template>

<script setup lang="ts">
import { useNavStore } from '@/stores/navStore';
import { useStateStore } from '@/stores/stateStore';
import type { NavItem } from '@/types'
import { safeOpenUrl } from '@/utils'
import { getFaviconUrl, extractDomain, getIconFallback } from '@/utils/favicon'
import { getCachedIcon, cacheIcon, deleteCachedIcon } from '@/utils/iconCache'
import { ElMessage, ElMessageBox, FormInstance, FormRules, InputInstance } from 'element-plus';
import { Edit, Delete } from '@element-plus/icons-vue';
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{ item: NavItem, groupId: string }>()
const store = useNavStore()
const stateStore = useStateStore()

// 点击item 打开网页
const handleClick = () => safeOpenUrl(props.item.url)

//// navitem 编辑和删除
const showActions = ref(false)

// 编辑弹窗逻辑
const dialogVisible = ref(false)
const isSubmitting = ref(false)
const formRef = ref<FormInstance>()
const firstFormInputRef = ref<InputInstance>()

const form = ref({
  title: '',
  url: '',
  icon: '',
  description: ''
})

// 校验规则
const rules: FormRules = {
  title: [
    {required: true, message: '请输入网站名称', trigger: 'blur'}
  ],
  url: [
    {required: true, message: '请输入网站地址', trigger: 'blur'},
    {type: 'url', message: '格式错误，需包含 http:// 或 https://', trigger: 'blur'}
  ]
}

// 点击编辑按钮 执行
const openEditDialog = () => {
  // 回填当前数据
  Object.assign(form.value, {
    title: props.item.title,
    url: props.item.url,
    icon: props.item.icon || '',
    description: props.item.description || ''
  })
  dialogVisible.value = true
  //清除历史校验状态
  nextTick(() => formRef.value?.clearValidate())
}

// editDialog opened后执行
const autoFocusFirstInput = () => {
  firstFormInputRef.value?.focus()
}

// 提交
const submitEdit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate() //校验失败会直接到catch
    isSubmitting.value = true

    // 更新item
    store.updateItem(props.groupId, props.item.id, form.value)
    ElMessage.success('更新导航成功')
    dialogVisible.value = false
  } catch {
    // 校验失败 更新失败
    ElMessage.error('更新导航失败')
  } finally {
    isSubmitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

// 删除按钮 删除item
const handleDelete = async () => {
  try {
    store.removeItem(props.groupId, props.item.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
    ElMessage.error('删除失败')
  }
}

/* 自动获取item的icon 如果自动获取失败 使用背景色和title首字母 */
////
// 图标相关状态
// 图标获取是否失败
const iconError = ref(true)
// 图标的网络地址 可通过这个地址下载到图标
const faviconUrl = ref('')  
// 请求图标的大小size
const iconSize = 64

// 获取 domain 类似 www.baidu.com
const iconDomain = computed(() => {
  return extractDomain(props.item.url)
})

// 如果图标失败 将使用这个 title首字 和 背景色
const fallbackIcon = computed(() => {
  return getIconFallback(props.item.title)
})

// 加载图标地址 调整图标相关状态
const loadFavicon = () => {
  // 只要开始加载，默认加载失败，直到加载成功改变iconError的状态
  iconError.value = true
  if (!iconDomain.value) {
    iconError.value = true
    return
  }

  // 如果有手写的 icon 地址，就使用
  // if (props.item.icon) {
  //   faviconUrl.value = props.item.icon
  //   return
  // } else {
  //   console.log(props.item)
  // }

  // 检查缓存
  const cached = getCachedIcon(iconDomain.value)
  if (cached) {
    faviconUrl.value = cached
    iconError.value = false
    console.log(`图标缓存命中：${props.item.title}`)
    return
  }

  // 缓存未命中 走网络请求
  faviconUrl.value = props.item.icon ? props.item.icon : getFaviconUrl(iconDomain.value, iconSize)

}

// 图标加载成功 回调
const handleIconLoaded = (e: Event) => {
  iconError.value = false

  // 图标若是从网络请求加载成功 尝试缓存到本地
  if (iconDomain.value && faviconUrl.value.startsWith('http')) {
    try {
      const img = e.target as HTMLImageElement
      const canvas = document.createElement('canvas')
      canvas.width = iconSize
      canvas.height = iconSize
      const ctx = canvas.getContext('2d')

      // 绘制图片到Canvas
      ctx?.drawImage(img, 0, 0, iconSize, iconSize)

      // 转为base64 并缓存
      const base64 = canvas.toDataURL('image/png')
      cacheIcon(iconDomain.value, base64)
      console.log('图标已缓存：' + props.item.title)
    } catch (error) {
      // 捕获跨域污染或者绘制失败 静默跳过
      console.log('图标缓存跳过（绘制失败 或 跨域限制）: ' + props.item.title)
    }
  }
}
// 图标加载失败 处理
const handleIconError = (e: Event) => {
  // 立即清除原生 error监听 防止浏览器死循环重试
  const target = e.target as HTMLImageElement
  target.onerror = null 

  iconError.value = true
  console.log(`图标加载失败：${props.item.title} 的domain： (${iconDomain.value})`)
}

// 监听url变化， 自动重新加载图标
watch(() => props.item.url, () => {
  loadFavicon()
})
// 监听item.icon变化, 清除icon缓存 重新加载图标
watch(() => props.item.icon, () => {
  if (getCachedIcon(iconDomain.value)) {
    deleteCachedIcon(iconDomain.value)
  }
  loadFavicon()
})
// 组件挂载时加载图标
onMounted(() => {
  loadFavicon()
})


</script>

<style scoped>
/* //// 包裹nav-item的外层容器 */
.nav-item-wrapper {
  position: relative;
  width: 200px;
  margin-bottom: 10px;
  /* flex-grow: 1; */
}

/* //// 用于展示导航项目的 卡片 */
.nav-item {
  cursor: pointer;
  transition: transform 0.2s;
  /* 卡片背景用变量 */
  background-color: var(--card-bg);
  /* 卡片边框 */
  border: 1px solid var(--border-color);

  border-radius: 10px;
  padding: 0px;
}

.nav-item:hover {
  transform: translate(0px, -5px);
  box-shadow: 0px 10px 20px 0px rgba(100, 100, 100, .1);
}

.nav-item:hover::before {
  position: absolute;
  left: 50%;
  top: 100%;
  width: 1px;
  height: 1px;
  content: "";
  background-color: transparent;
  box-shadow: var(--hover-shadow-nav-before);
}


/* // 卡片内容区域 flex布局 里面包含图片区 和 文字区 */
.nav-item .content {
  display: flex;
  height: 80px;
  align-items: center;
  gap: 10px;
  padding: 15px;
}

/* // 卡片内容区域的 图片区 */
.content .icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  /* 防止被压缩 */
  flex-shrink: 0; 
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

/* img标签 */
.content .icon-wrapper .site-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: contain;
  background: rgba(255, 255, 255, 1);
  /* padding: 2px; */
  box-sizing: border-box;
}
.icon-wrapper .fallback-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 卡片内容区域的 文字区 */
.content .info {
  /* 作为flex item允许无限压缩 */
  min-width: 0;
  overflow-y: auto;
}
.info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  /* 文字颜色用变量 */
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info h6 {
  /* 设置两行显示，超出部分显示... */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  margin-top: 2px;
  line-height: 1.3;
  color: var(--text-secondary);
}

/* //// 操作按钮定位 */
.actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 10;
}
.actions .el-button {
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  /* 毛玻璃效果 */
  backdrop-filter: blur(4px); 
}
</style>
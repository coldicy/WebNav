<template>
  <div class="func-bar">
    <div class="bar">
      <el-button title="切换主题" circle :type="isDark ? 'warning' : 'default'" :icon="isDark ? Moon : Sunny"
        @click="handleToggleDark"></el-button>
      <el-button title="编辑模式" circle :type="stateStore.gStateEditMode ? 'success' : 'default'" :icon="EditPen"
        @click="handleEditMode"></el-button>
      <el-button title="导出" circle :icon="Download" @click="handleExport"></el-button>
      <el-button title="导入" circle :icon="Upload" :loading="isImporting" @click="handleImport"></el-button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus';
import { Sunny, Moon, EditPen, Download, Upload } from '@element-plus/icons-vue';
import { useDark, useToggle } from '@vueuse/core';
import { useStateStore } from '@/stores/stateStore';
import { useNavStore } from '@/stores/navStore';
import { exportNavData } from '@/utils/export';
import { ref } from 'vue'

//// 基础变量
// 全局 模式是否开启的 状态
const stateStore = useStateStore()
// navStore 存储着 nav数据
const navStore = useNavStore()

//// 编辑模式切换
const handleEditMode = () => {
  stateStore.gStateEditMode = !stateStore.gStateEditMode
}

////暗黑模式切换
// 创建暗黑模式响应式状态
//isDark 是一个ref布尔值 true是暗黑模式
const isDark = stateStore.gStateDarkMode = useDark({
  storageKey: 'web-nav-theme',
})
// 创建切换函数
// useToggle 会返回一个函数，调用它就自动切换 isDark 的值
const toggleDark = useToggle(isDark)
const handleToggleDark = () => {

  toggleDark()

}

//// 导入导出
// 导出
const handleExport = () => {
  if (navStore.groups.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  try {
    exportNavData(navStore.groups)
    ElMessage.success('数据成功导出')
  } catch (error) {
    ElMessage.error('导出失败，请重试')
  }
}

// 导入
const isImporting = ref(false)
const handleImport = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,application/json'

  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    // 开始转圈提示
    isImporting.value = true
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)

        // 简单验证
        if (!json.groups || !Array.isArray(json.groups)) {
          ElMessage.error('无效的备份文件')
          throw new Error('无效的备份文件')
        }

        // 直接替换数据
        await ElMessageBox.confirm('导入将覆盖当前所有数据，确定继续？', '数据导入提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 直接赋值
        navStore.groups = json.groups
        navStore.sync() // 持久化

        ElMessage.success('导入成功')

      } catch (error: any) {
        ElMessage.error(error.message || '导入失败')

      } finally {
        isImporting.value = false
      }
    }

    reader.readAsText(file)
  }
  input.click() // 触发文件选择
}

</script>

<style scoped></style>
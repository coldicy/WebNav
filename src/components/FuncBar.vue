<template>
  <div class="func-bar">
    <div class="bar">
      <el-button title="切换主题" circle :type="isDark ? 'warning' : 'default'" :icon="isDark ? Moon : Sunny"
        @click="handleToggleDark"></el-button>
      <el-button title="编辑模式" circle :type="stateStore.gStateEditMode ? 'success' : 'default'" :icon="EditPen"
        @click="handleEditMode"></el-button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus';
import { Sunny, Moon, EditPen } from '@element-plus/icons-vue';
import { useDark, useToggle } from '@vueuse/core';
import { useStateStore } from '@/stores/stateStore';

//// 基础变量
// 全局 模式是否开启的 状态
const stateStore = useStateStore()

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

</script>

<style scoped></style>
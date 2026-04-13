<template>
  <div class="search">
    <el-input style="width: 200px;" size="default" v-model="keyword" @keyup.enter="openUrl" :placeholder="engineName + '搜索...'" clearable :prefix-icon="Search"></el-input>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { ref } from 'vue';
import { safeOpenUrl } from '@/utils';
import { Search } from '@element-plus/icons-vue';

const emit = defineEmits(['update:keyword'])
const keyword = ref('')
// 正在使用的搜索引擎的名字
const engineName = ref<string>('百度')

// engines对象
const engines: Record<string, string> = {
  '百度': 'https://www.baidu.com/s?wd=',
  '谷歌': 'https://www.google.com/search?q='
}

// 计算属性，拼接url进行搜索
const url = computed((): string => {
  return engines[engineName.value]+keyword.value
})

// 输入框 enter按键 执行打开url
const openUrl = () => {
  if (url.value && url.value.trim()) {
    safeOpenUrl(url.value.trim())
    keyword.value = ''
  }
}

// 监听 keyword的值，即使通知父组件
watch(() => keyword.value, () => {
  emit('update:keyword', keyword.value)
})
</script>

<style scoped>
  
</style>
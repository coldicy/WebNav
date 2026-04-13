<template>
  <div class="search" v-show="engineName">
    <el-button title="改变引擎" @click.stop="changeEngine" class="btn-engine-change" size="small" circle :type="engineColor"></el-button>
    <el-input style="width: 200px;" size="default" v-model="keyword" @keyup.enter="openUrl" :placeholder="engineName + '搜索...'" clearable ></el-input>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { ref } from 'vue';
import { safeOpenUrl } from '@/utils';
import { Search } from '@element-plus/icons-vue';
import { getEngineName, setEngineName } from '@/utils/setting';

const emit = defineEmits(['update:keyword'])
const keyword = ref('')
// 正在使用的搜索引擎的名字
const engineName = ref('')
// 如果是百度 对应蓝色 谷歌 对应黄色
const engineColor = computed(() => {
  if (engineName.value === '百度') return 'primary'
  else if (engineName.value === '谷歌') return 'warning'
  else return 'default'
})

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

//
const changeEngine = () => {
  if (engineName.value === '百度') engineName.value = '谷歌'
  else engineName.value = '百度'
  setEngineName(engineName.value)
}

// 监听 keyword的值，即使通知父组件
watch(() => keyword.value, () => {
  emit('update:keyword', keyword.value)
})

//// onmounted
onMounted(() => {
  engineName.value = getEngineName()
})
</script>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search .btn-engine-change {
  /* position: absolute;
  top: 4px;
  left: 4px;

  vertical-align: center;
  z-index: 1000; */
}
</style>
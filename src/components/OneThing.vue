<template>
  <div class="one-thing">

    <div class="text" v-show="!isEditting" @dblclick="handleEdit">
      {{ thing }}
    </div>
    <div class="input" v-show="isEditting">
      <el-input placeholder="输入你要做的事" :rows="5" type="textarea" ref="inputRef" v-model="thing" @blur="saveEdit" @keyup.esc="cancelEdit" clearable></el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getOneThing, setOneThing } from '@/utils/setting';
import { ElMessage } from 'element-plus';
import { nextTick, onMounted, ref, Ref } from 'vue';

//// 一些状态变量
const isEditting = ref(true)

// 编辑前 保存 原来的thing 的值
let thingOrigin = ''
const thing: Ref<string> = ref('')
const inputRef = ref()

/* 双击打开编辑模式 */
const handleEdit = () => {
  isEditting.value = true
  thingOrigin = thing.value
  nextTick(() => {
    return inputRef.value?.focus()
  })
}

/* save edit */
const saveEdit = (): void => {
  if (thing.value?.trim()) {
    if (thing.value.trim() === thingOrigin.trim()) {
      isEditting.value = false
      return
    }
    sync()
    isEditting.value = false
  } else {
    thing.value = ''
  }
  
}

/* cancel edit */
const cancelEdit = () => {
  thing.value = thingOrigin
  isEditting.value = false
}

//// 保存到localstorage
const sync = () => {
  ElMessage.success('save thing')
  setOneThing(thing.value)
}


onMounted(() => {
  thing.value = getOneThing()
  isEditting.value = false

})
</script>

<style scoped>
.text {
  user-select: none;
  cursor: text;
  color: aliceblue;
  padding: 0 20px;
  white-space: pre-wrap;
}
.text:hover {
  color: aqua;
}


</style>
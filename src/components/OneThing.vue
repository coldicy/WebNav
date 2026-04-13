<template>
  <div class="one-thing">

    <div class="text" v-show="!isEditting" @dblclick="handleEdit">
      {{ thing }}
    </div>
    <div class="input" v-show="isEditting">
      <el-input ref="inputRef" v-model="thing" @blur="saveEdit" @keyup.enter="saveEdit" @keyup.esc="cancelEdit"></el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { nextTick, ref, Ref } from 'vue';

//// 一些状态变量
const isEditting = ref(false)

// 编辑前 保存 原来的thing 的值
let thingOrigin = ''
const thing: Ref<string> = ref('moren')
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
    isEditting.value = false
    if (thing.value.trim() === thingOrigin) return
    sync()
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
}

</script>

<style scoped>
.text {
  user-select: none;
  cursor: text;
  color: aliceblue;
}
.text:hover {
  color: aqua;
}


</style>
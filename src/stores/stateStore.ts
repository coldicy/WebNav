import { UseDarkReturn } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useStateStore = defineStore('state', () => {
  //编辑模式
  const gStateEditMode = ref(false)
  //暗黑模式
  const gStateDarkMode = ref<UseDarkReturn>()
  // 是否允许拖拽
  const gStateIfDraggable = ref(true)


  return {
    gStateDarkMode,
    gStateEditMode,
    gStateIfDraggable
  }
})
<template>
  <el-card class="nav-group" >
    <template #header>
      <div class="header">
        <!-- 双击后进入输入框 否则展示分组标题 -->
        <el-input
          v-if="isEditing"
          v-model="editingName"
          size="small"
          class="edit-input"
          @blur="saveName"
          @keyup.enter="saveName"
          @keyup.esc="cancelEdit"
          ref="inputRef"
          clearable
          maxlength="15"
          show-word-limit
        ></el-input>
        <h3 v-else @dblclick="startEdit" class="group-title">{{ group.name }}</h3>
        
         <div class="func">
          <!-- 打开添加item的表单弹窗 -->
          <el-button size="small" type="primary" plain @click="openAddDialog">+ 添加</el-button>
          <!-- 置顶分组 -->
          <el-button size="small" type="primary" plain circle @click="topGroup"><el-icon><Top /></el-icon></el-button>
         </div>
        
      </div>
    </template>

    <!-- 可拖拽分组 -->
    <draggable v-model="group.items" group="nav" item-key="id" class="items-grid" animation="200" @end="onDragEnd">
      <template #item="{ element }">
        <NavItem :item="element" :group-id="group.id" />
      </template>
    </draggable>

    <!-- 添加导航项的表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加导航"
      width="420px"
      :close-on-click-modal="true"
      @opened="autoFocusFirstInput"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="top"
        @submit.prevent="submitForm"
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
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="isSubmitting">确定</el-button>
      </template>

    </el-dialog>

  </el-card>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import draggable from 'vuedraggable'
import NavItem from './NavItem.vue'
import type { NavGroup } from '@/types'
import { useNavStore } from '@/stores/navStore'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

const props = defineProps<{ group: NavGroup }>()
const store = useNavStore()

//// 新增 双击重命名group名字
// 编辑状态控制
const isEditing = ref(false)
const editingName = ref('')
const inputRef = ref()

// 进入编辑模式
const startEdit = () => {
  isEditing.value = true
  editingName.value = props.group.name
  // 等待DOM更新后 自动聚焦输入框
  nextTick(() => {
    return inputRef.value?.focus()
  })
}

// 保存重命名
const saveName = () => {
  // 如果没有更改，直接退出
  if (editingName.value.trim() === props.group.name) {
    cancelEdit()
    return
  }
  store.updateGroupName(props.group.id, editingName.value)
  isEditing.value = false
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  editingName.value = ''
}

//// 添加导航项 相关
const dialogVisible = ref(false)
const isSubmitting = ref(false)
const formRef = ref<FormInstance>()
const firstFormInputRef = ref()
// 管理表单数据 
const formDefault = {
  title: '',
  url: '',
  icon: '',
  description: ''
}
const form = ref({...formDefault})

// element plus 表单验证规则
const rules: FormRules = {
  title: [{required: true, message: '请输入网站名称', trigger: 'blur'}],
  url: [
    {required: true, message: '请输入链接地址', trigger: 'blur'},
    {type: 'url', message: '格式错误，需包含http://或http://', trigger: 'blur'}
  ]
}

// 打开弹窗
const openAddDialog = () => {
  dialogVisible.value = true
}
const autoFocusFirstInput = () => {
  // 弹窗打开后自动聚焦第一个输入框 这里需要用 dialog 的 opened 属性，确保dialog完全打开
  nextTick(() => firstFormInputRef.value?.focus())
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  // 触发表单验证 valid 为true才执行后续逻辑
  await formRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true
      try {
        // 调用pinia方法添加数据
        store.addItem(props.group.id, {
          title: form.value.title.trim(),
          url: form.value.url.trim(),
          icon: form.value.icon.trim() || undefined,
          description: form.value.description.trim() || undefined
        })
        ElMessage.success('添加成功')
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('添加失败，请重试')
      } finally {
        isSubmitting.value = false
      }
    }
  })
}

// 关闭弹窗时 重置表单
const resetForm = () => {
  // form.value = {...formDefault}  //这只能重置表单数据，却没有清除formRef的验证状态，所以有缺陷
  // 使用正确的清除
  formRef.value?.resetFields()

}

////
/* 置顶分组 */
const topGroup = () => {
  store.groups = store.groups.filter((g) => {
    return g.id !== props.group.id
  })
  store.groups.unshift(props.group)
  store.updateGroupOrder(store.groups)
}

//// 拖拽后执行
const onDragEnd = () => {
  store.updateItemOrder(props.group.id, props.group.items)
}
</script>

<style scoped>
.nav-group {
  height: 100%;
  /* 分组卡片背景 */
  background-color: var(--card-bg);
  /* 边框颜色 */
  border: 1px solid var(--border-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* padding-bottom: 12px; */
  /* 头部底边框 */
  /* border-bottom: 1px solid var(--border-color); */
}

.header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.group-title {
  cursor: text;
  user-select: none;  /* 防止双击选中文字 */
  transition: color 0.2s;
}
.group-title:hover {
  color: #409eff;
}

.edit-input {
  width: 20em;
  margin-right: 8px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
  min-height: 60px;
  padding: 8px 0;
}
</style>
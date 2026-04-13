<template>

  <div class="nav-group">



    <div class="group-header" @mouseenter="showFunc = true" @mouseleave="showFunc = false">
      <!-- 双击后进入输入框 否则展示分组标题 -->
      <div class="group-title">
        <el-input v-if="isEditing" v-model="editingName" size="default" class="edit-input" @blur="saveName"
          @keyup.enter="saveName" @keyup.esc="cancelEdit" ref="inputRef" clearable maxlength="15"
          show-word-limit></el-input>
        <h3 v-else @dblclick="startEdit" class="group-name">{{ group.name }}</h3>
      </div>


      <div class="func" v-show="showFunc">
        <!-- 打开添加item的表单弹窗 -->
        <el-button title="添加导航" size="small" type="default" plain @click="openAddDialog">
          <el-icon>
            <AddLocation />
          </el-icon>
        </el-button>
        <el-popconfirm width="160" title="确定要删除这个分组吗？">
          <template #reference>
            <el-button title="删除分组" size="small" type="default" plain>
              <el-icon>
                <FolderDelete />
              </el-icon>
            </el-button>
          </template>
          <template #actions="{ confirm, cancel }">
            <el-button size="small" type="default" text @click="cancel">取消</el-button>
            <el-button size="small" type="danger" text @click="deleteGroup">删除</el-button>
          </template>
        </el-popconfirm>

        <!-- 置顶分组 -->
        <el-button title="置顶分组" size="small" type="default" plain @click="topGroup">
          <el-icon>
            <Top />
          </el-icon>
        </el-button>
      </div>

    </div>

    <div class="group-body">
      <!-- 可拖拽分组 -->
      <draggable v-model="group.items" tag="div" group="nav" item-key="id" class="groups" animation="200"
        @end="onDragEnd">
        <template #item="{ element }">
          <div>
            <NavItem :item="element" :group-id="group.id" />
          </div>
        </template>
      </draggable>
    </div>



    <!-- 添加导航项的表单弹窗 -->
    <el-dialog v-model="dialogVisible" title="添加导航" width="420px" :close-on-click-modal="true"
      @opened="autoFocusFirstInput" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" label-position="top"
        @submit.prevent="submitForm">
        <el-form-item label="网站名称" prop="title">
          <el-input ref="firstFormInputRef" v-model="form.title" placeholder="请输入网站标题" clearable maxlength="20"
            show-word-limit />
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import draggable from 'vuedraggable'
import NavItem from './NavItem.vue'
import type { NavGroup } from '@/types'
import { useNavStore } from '@/stores/navStore'
import { ElMessage, FormInstance, FormRules, ElPopconfirm } from 'element-plus'
import { Top, FolderDelete, AddLocation } from '@element-plus/icons-vue'

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
const form = ref({ ...formDefault })

// element plus 表单验证规则
const rules: FormRules = {
  title: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
  url: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    { type: 'url', message: '格式错误，需包含http://或http://', trigger: 'blur' }
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
/* 置顶当前分组 */
const topGroup = () => {
  store.groups = store.groups.filter((g) => {
    return g.id !== props.group.id
  })
  store.groups.unshift(props.group)
  store.updateGroupOrder(store.groups)
}

////
/* 删除当前分组 */
const deleteGroup = () => {
  store.groups = store.groups.filter((g) => {
    return g.id !== props.group.id
  })
  store.updateGroupOrder(store.groups)
}

//// 当鼠标移动到分组时才展示 功能组的所有操作按钮
const showFunc = ref(false)

//// 拖拽后执行
const onDragEnd = () => {
  store.updateItemOrder(props.group.id, props.group.items)
}
</script>

<style scoped>
.nav-group {}

.group-header {
  display: flex;
  gap: 2em;
  justify-content: space-between;
  align-items: center;
  height: 4em;
  margin-bottom: 0em;
}

.group-header .group-title {}

.group-header .group-title .group-name {
  cursor: text;
  /* 防止双击选中文字 */
  user-select: none;
  transition: color 0.2s;

  font-weight: 400;
  font-size: 18px;
  color: rgba(100, 100, 100, 1);
}

.group-header .group-title .group-name:hover {
  color: #409eff;
}

.edit-input {
  width: 20em;
  margin-right: 8px;
}

/* //// 组内item的布局 */
.group-body .groups {
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  align-content: start;
  column-gap: 20px;

}

/* 填充flex的span */
.group-body .groups .fill-flex-span {
  width: 160px;
}
</style>
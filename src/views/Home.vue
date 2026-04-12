<template>
  <div class="home">
    <header class="top-bar">
      <!-- 用户信息 退出 -->
      <div class="userinfo">
        <span>{{ authStore.currentUser }}</span>
        <el-button type="danger" plain size="small" @click="authStore.logout">退出登录</el-button>
      </div>
      <h1>Web Nav</h1>
      <div class="actions">
        <el-button type="primary" @click="handleAddGroup">+ 新建分组</el-button>
        <el-button type="danger" plain @click="clearData">清空数据</el-button>
        <!-- 暗黑模式切换按钮 -->
        <el-button :type="isDark ? 'warning' : 'default'" :icon="isDark ? Moon : Sunny" circle
          @click="handleToggleDark" title="切换主题" />
      </div>
    </header>

    <div class="search">
      <el-input v-model="keyword" placeholder="搜索..."></el-input>
    </div>

    <!-- 暂时有问题，整个项目的draggable得做修改 -->
    <!-- <draggable
      v-model="filteredGroups"
      item-key="id"
      class="groups-container"
      animation="200"
      @end="onGroupDragEnd"
      :delay="2000"
    >
      <template #item="{ element }">
        <NavGroup :group="element" />
      </template>
</draggable> -->

    <div v-for="group in filteredGroups">
      <NavGroup :group="group"></NavGroup>
    </div>

    <el-empty v-if="store.groups.length === 0" description="暂无导航，点击右上角添加" />
  </div>
</template>

<script setup lang="ts">
// 手动导入图标
import { Moon, Sunny } from '@element-plus/icons-vue'
import NavGroup from '@/components/NavGroup.vue'
import { useNavStore } from '@/stores/navStore'
import { ref } from 'vue'
import { computed } from 'vue'
// 新增：导入@vueuse/core的主题工具
import { useDark, useToggle } from '@vueuse/core'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'

////
const authStore = useAuthStore()
const store = useNavStore()
// const onGroupDragEnd = () => store.updateGroupOrder(store.groups)
// 考虑上这个清空全部数据的操作还是不给了吧
const clearData = () => {
  if (confirm('确定要清空所有导航数据吗？')) {
    store.groups = []
    store.updateGroupOrder(store.groups)
    location.reload()
  }
}

//// 搜索关键词
const keyword = ref('')
const filteredGroups = computed(() => {
  if (!keyword.value || !keyword.value.trim()) return store.groups;
  return store.groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.title.toLowerCase().includes(keyword.value.toLowerCase()))
  })).filter(group => group.items.length > 0)
})

////暗黑模式切换
// 新增：创建暗黑模式响应式状态
//isDark 是一个ref布尔值 true是暗黑模式
const isDark = useDark({
  storageKey: 'web-nav-theme',
})
// 创建切换函数
// useToggle 会返回一个函数，调用它就自动切换 isDark 的值
const toggleDark = useToggle(isDark)
const handleToggleDark = () => {
  console.log('切换前 isDark：', isDark.value)
  toggleDark()
  console.log('切换后 isDark：', isDark.value)
}

//// 修改addGroup的交互
const handleAddGroup = async () => {
  try {
    //弹出输入框，等待用户确认
    const { value } = await ElMessageBox.prompt('请输入分组名称', '新建分组', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S/, //正则，必须包含至少一个非空字符
      inputErrorMessage: '分组名称不能为空',
      inputValidator: (val) => val.length > 10 ? '名称不能超过10个字符' : true
    })
    //用户确认后 调用store方法创建分组
    store.addGroup(value.trim())
  } catch {
    // 用户点击取消 按esc 或关闭弹窗时，直接静默处理
  }
}


</script>

<style scoped>
.home {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  /* 底边框用变量 */
  border-bottom: 1px solid var(--border-color);
}

.top-bar h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.groups-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.userinfo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 16px;
  padding: 4px 12px;
  background: var(--card-bg);
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
</style>
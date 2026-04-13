<template>
  <div class="home">
    <!-- 固定在home右下角的操作集合 -->
    <div class="fixed-actions">
      <el-button title="添加分组" circle type="default" @click="handleAddGroup">
        <el-icon>
          <FolderAdd />
        </el-icon>
      </el-button>
      <el-popconfirm :title="authStore.currentUser + '，确定退出登录吗？'">
        <template #reference>
          <el-button :title="authStore.currentUser + '，退出登录'" circle type="default" >
            <el-icon>
              <User />
            </el-icon>
          </el-button>
        </template>
        <template #actions="{ confirm, cancel }">
          <el-button size="small" text @click="cancel">取消</el-button>
          <el-button size="small" type="danger" text @click="authStore.logout">退出</el-button>
        </template>

      </el-popconfirm>


    </div>

    <!-- 侧面常驻信息栏 -->
    <div class="sidebar bar">
      <TimeShow />
      <ElDivider />
      <FuncBar />
      <ElDivider />
      <Search v-model:keyword="keyword" />
    </div>

    <main class="main">
      <div class="title">
        <h1></h1>
      </div>

      <div v-for="group in filteredGroups">
        <NavGroup :group="group"></NavGroup>
      </div>

      <el-empty v-if="store.groups.length === 0" description="暂无导航，点击右上角添加" />
    </main>

  </div>
</template>

<script setup lang="ts">
// 手动导入图标
import { Moon, Sunny, FolderAdd, User } from '@element-plus/icons-vue'
import NavGroup from '@/components/NavGroup.vue'
import { useNavStore } from '@/stores/navStore'
import { useStateStore } from '@/stores/stateStore'
import { ref } from 'vue'
import { computed } from 'vue'
// 新增：导入@vueuse/core的主题工具
import { useDark, useToggle } from '@vueuse/core'
import { ElDivider, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'

////
const stateStore = useStateStore()
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
// 接收从子组件Search更新来的值 修改keyword的值
const updateKeyword = (value: string) => {
  keyword.value = value
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
/* //// 最外层wrapper */
.home {
  position: relative;
  display: flex;
  max-width: 2560px;
  margin: 0 auto;
}

/* //// 固定在左侧的 侧边栏 */
.home .sidebar {
  padding-top: calc(2em + 25px);
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  gap: 2em;
}

/* //// 固定在home区域右下角的 操作集合 */
.home .fixed-actions {
  position: fixed;
  right: 20px;
  bottom: 50px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 10px;
}

.home .fixed-actions .el-button {
  margin: 0;
}


/* //// 侧面边栏 */
.bar {
  height: 100vh;
  width: 280px;
}

.sidebar {
  flex-shrink: 0;
  flex-grow: 0;
  background-color: rgba(43, 43, 43, 1);

  position: sticky;
  top: 0;

  overflow-y: auto;
}

/* //// 右侧主体部分 */
.main {
  flex-grow: 1;
  padding: 2em;
  padding-top: 1em;
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
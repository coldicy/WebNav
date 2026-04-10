<template>
  <div class="login">
    <el-card class="login-card" shadow="always">
      <h2 class="title">Web Nav 登录</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" label-position="top" size="large">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" maxlength="15" show-word-limit clearable placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password clearable placeholder="请输入密码"></el-input>
        </el-form-item>
        <div class="action">
          <el-button class="btn" type="primary" size="default" plain @click="handleAuth('login')"
            :loading="loading">登录</el-button>
          <el-button class="btn" type="primary" size="default" plain @click="handleAuth('register')"
            :loading="loading">注册</el-button>
        </div>
      </el-form>
      <div class="tips">copyright@weboth 2026</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { ElMessage, FormRules } from 'element-plus';
import { FormInstance } from 'element-plus';
import { ref } from 'vue'
//// 基础数据
// 
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
// 表单数据
const formDefault = {
  username: '',
  password: ''
}
const form = ref({ ...formDefault })
// 表单验证
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 15, message: '长度2-15个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码至少4位', trigger: 'blur' }
  ]
}

//// 处理登录注册
const handleAuth = async (action: 'login' | 'register') => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    // 如果表单验证不通过 直接返回
    if (!valid) return
    loading.value = true

    const success = action === 'login'
      ? authStore.login(form.value.username, form.value.password)
      : authStore.register(form.value.username, form.value.password)

    if (success) {
      ElMessage.success(action === 'login' ? '登录成功' : '注册并登录成功')
    } else {
      ElMessage.error(action === 'login' ? '用户名或密码错误' : '用户名已存在')
    }
    loading.value = false
  })
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--bg-color);
  transition: background-color 0.3s;
}

.login-card {
  width: 380px;
  padding: 24px;
  padding-bottom: 0;
}

.title {
  text-align: center;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.action {
  display: flex;
  justify-content: end;
}

.action .btn {
  width: 20%;
  margin: 0;
  margin-top: 12px;
  margin-left: 6px;
  padding: 0;
}

.tips {
  margin-top: 32px;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1;
}
</style>
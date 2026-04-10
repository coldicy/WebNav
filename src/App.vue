<template>
  <el-config-provider>
    <LoginView v-if="!authStore.isLogined" />
    <Home v-else />
  </el-config-provider>
</template>

<script setup lang="ts">
import Home from '@/views/Home.vue'
import LoginView from './views/LoginView.vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore()
</script>
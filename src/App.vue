<template>
  <el-config-provider>
    <LoginView v-if="!authStore.isLogined" />
    <div v-else>

      <Home />
    </div>
    
  </el-config-provider>
</template>

<script setup lang="ts">
import Home from '@/views/Home.vue'
import LoginView from './views/LoginView.vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore()
</script>
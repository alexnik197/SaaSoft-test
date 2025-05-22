<template>
  <v-app>
    <v-app-bar flat>
      <div class="header-content">
        <div class="logo">
          <img src="@/assets/logo-main.png" alt="logo">
          <h1>SaaSoft</h1>
        </div>
        <v-btn icon @click="changeTheme">
          <v-icon size="2rem" v-show="!isDark">mdi-white-balance-sunny</v-icon>
          <v-icon size="2rem" v-show="isDark">mdi-weather-night</v-icon>
        </v-btn>
      </div>
    </v-app-bar>
    <v-main>
      <AccountForm />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AccountForm from '@/components/AccountForm.vue'
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const changeTheme = () => {
  theme.global.name.value = theme.global.name.value === 'dark' ? 'light' : 'dark'
}

const isDark = computed(() => theme.global.current.value.dark)
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.logo {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

img {
  max-height: 48px;
  height: auto;
  width: auto;
}

</style>

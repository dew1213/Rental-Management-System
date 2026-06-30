<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top nav -->
    <header class="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <UIcon name="i-heroicons-home" class="text-white text-sm" />
          </div>
          <span class="font-semibold text-gray-900 text-sm">Rental System</span>
        </div>

        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === item.to
              ? 'bg-green-50 text-green-600'
              : 'text-gray-600 hover:bg-gray-50'"
          >
            <UIcon :name="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 hidden md:block">สวัสดี, {{ userName }}</span>
          <UButton
            icon="i-heroicons-arrow-right-on-rectangle"
            variant="ghost"
            color="red"
            size="sm"
            @click="logout"
          />
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { userName, logout } = useAuth()

const navItems = [
  { to: '/tenant/dashboard', icon: 'i-heroicons-squares-2x2', label: 'ภาพรวม' },
  { to: '/tenant/payments', icon: 'i-heroicons-banknotes', label: 'ประวัติชำระ' },
  { to: '/tenant/maintenance', icon: 'i-heroicons-wrench-screwdriver', label: 'แจ้งซ่อม' },
]
</script>

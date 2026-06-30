<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-200 flex flex-col z-40">
      <div class="px-6 py-5 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <UIcon name="i-heroicons-home" class="text-white text-sm" />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Rental System</p>
            <p class="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p class="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">เมนูหลัก</p>
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path === item.to
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
          {{ item.label }}
          <UBadge v-if="item.badge" :label="item.badge" color="red" size="xs" class="ml-auto" />
        </NuxtLink>
      </nav>

      <div class="px-3 py-4 border-t border-gray-100">
        <div class="flex items-center gap-3 px-3 py-2 mb-1">
          <UAvatar :alt="userName || 'Admin'" size="sm" chip-color="green" chip-text="" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <UButton
          variant="ghost"
          color="red"
          icon="i-heroicons-arrow-right-on-rectangle"
          label="ออกจากระบบ"
          block
          class="justify-start"
          @click="logout"
        />
      </div>
    </aside>

    <!-- Main -->
    <div class="pl-60">
      <header class="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 class="text-base font-semibold text-gray-900">{{ pageTitle }}</h1>
          <p class="text-xs text-gray-400">{{ new Date().toLocaleDateString('th-TH', { dateStyle: 'full' }) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <UButton icon="i-heroicons-bell" variant="ghost" color="gray" size="sm" />
          <UColorModeButton size="sm" />
        </div>
      </header>

      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { userName, logout } = useAuth()
const route = useRoute()

const navItems = [
  { to: '/admin/dashboard', icon: 'i-heroicons-squares-2x2', label: 'Dashboard' },
  { to: '/admin/houses', icon: 'i-heroicons-home-modern', label: 'จัดการบ้าน' },
  { to: '/admin/tenants', icon: 'i-heroicons-users', label: 'จัดการผู้เช่า' },
  { to: '/admin/contracts', icon: 'i-heroicons-document-text', label: 'สัญญาเช่า' },
  { to: '/admin/payments', icon: 'i-heroicons-banknotes', label: 'การชำระเงิน' },
  { to: '/admin/maintenance', icon: 'i-heroicons-wrench-screwdriver', label: 'แจ้งซ่อม' },
]

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/houses': 'จัดการบ้าน',
  '/admin/tenants': 'จัดการผู้เช่า',
  '/admin/contracts': 'สัญญาเช่า',
  '/admin/payments': 'การชำระเงิน',
  '/admin/maintenance': 'แจ้งซ่อมบำรุง',
}

const pageTitle = computed(() => pageTitles[route.path] || 'Admin')
</script>

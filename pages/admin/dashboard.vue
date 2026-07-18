<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <UCard v-for="stat in stats" :key="stat.label" :ui="{ body: { padding: 'p-4' } }">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-medium text-gray-500">{{ stat.label }}</p>
          <div :class="`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`">
            <UIcon :name="stat.icon" :class="`text-sm ${stat.color}`" />
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        <p class="text-xs text-gray-400 mt-0.5">{{ stat.sub }}</p>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Overdue Payments -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500" />
                <h2 class="text-sm font-semibold">ค้างชำระ</h2>
                <UBadge :label="overdueList.length.toString()" color="red" size="xs" />
              </div>
              <UButton to="/admin/payments" variant="link" size="xs" label="ดูทั้งหมด" trailing-icon="i-heroicons-arrow-right" />
            </div>
          </template>

          <div v-if="overdueList.length === 0" class="py-8 text-center text-sm text-gray-400">
            ไม่มีรายการค้างชำระ 🎉
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="p in overdueList.slice(0, 5)"
              :key="p.id"
              class="flex items-center justify-between py-3 px-1"
            >
              <div>
                <p class="text-sm font-medium text-gray-800">สัญญา #{{ p.contractId }}</p>
                <p class="text-xs text-gray-400">ครบกำหนด {{ formatDate(p.dueDate) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-red-600">฿{{ p.amount.toLocaleString() }}</p>
                <UBadge label="ค้างชำระ" color="red" variant="subtle" size="xs" />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- House Status -->
      <div>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-home-modern" class="text-primary-500" />
              <h2 class="text-sm font-semibold">สถานะบ้าน</h2>
            </div>
          </template>

          <div class="space-y-3">
            <div v-for="item in houseStatusData" :key="item.label" class="flex items-center gap-3">
              <div :class="`w-2.5 h-2.5 rounded-full ${item.dot}`" />
              <div class="flex-1">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-600">{{ item.label }}</span>
                  <span class="font-medium">{{ item.count }}</span>
                </div>
                <UProgress :value="item.pct" :color="item.color" size="xs" />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Quick Links -->
        <UCard class="mt-4">
          <template #header>
            <h2 class="text-sm font-semibold">ทางลัด</h2>
          </template>
          <div class="grid grid-cols-2 gap-2">
            <UButton
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
              :icon="link.icon"
              :label="link.label"
              variant="soft"
              color="gray"
              size="sm"
              class="justify-start text-xs"
            />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboard } from '~/composables/useDashboard'

definePageMeta({ middleware: 'auth', layout: 'admin' })

const {
  adminDashboard,
  loading,
  fetchAdminDashboard
} = useDashboard()

const overdueList = computed(
  () => adminDashboard.value?.overduePayments ?? []
)


onMounted(async () => {
  await fetchAdminDashboard()
})

const stats = computed(() => [
  {
    label: 'บ้านทั้งหมด',
    value: adminDashboard.value?.totalHouses ?? 0,
    sub: `ว่าง ${
      (adminDashboard.value?.totalHouses ?? 0) -
      (adminDashboard.value?.occupiedHouses ?? 0) -
      (adminDashboard.value?.maintenanceHouses ?? 0)
    } หลัง`,
    icon: 'i-heroicons-home-modern',
    bg: 'bg-blue-50',
    color: 'text-blue-500'
  },
  {
    label: 'ผู้เช่า',
    value: adminDashboard.value?.totalTenants ?? 0,
    sub: 'คนทั้งหมด',
    icon: 'i-heroicons-users',
    bg: 'bg-green-50',
    color: 'text-green-500'
  },
  {
    label: 'ค้างชำระ',
    value: overdueList.value.length,
    sub: 'รายการ',
    icon: 'i-heroicons-exclamation-triangle',
    bg: 'bg-red-50',
    color: 'text-red-500'
  },
  {
    label: 'รายรับ/เดือน',
    value: `฿${(adminDashboard.value?.monthlyRevenue ?? 0).toLocaleString()}`,
    sub: 'เดือนปัจจุบัน',
    icon: 'i-heroicons-banknotes',
    bg: 'bg-amber-50',
    color: 'text-amber-500'
  }
])

const houseStatusData = computed(() => {
  const total = adminDashboard.value?.totalHouses ?? 0
  const occupied = adminDashboard.value?.occupiedHouses ?? 0
  const maintenance = adminDashboard.value?.maintenanceHouses ?? 0
  const available = total - occupied - maintenance

  return [
    {
      label: 'เช่าแล้ว',
      count: occupied,
      pct: total ? Math.round(occupied / total * 100) : 0,
      dot: 'bg-green-500',
      color: 'green'
    },
    {
      label: 'ว่าง',
      count: available,
      pct: total ? Math.round(available / total * 100) : 0,
      dot: 'bg-blue-500',
      color: 'blue'
    },
    {
      label: 'ซ่อมบำรุง',
      count: maintenance,
      pct: total ? Math.round(maintenance / total * 100) : 0,
      dot: 'bg-amber-500',
      color: 'yellow'
    }
  ]
})

const quickLinks = [
  { to: '/admin/houses', icon: 'i-heroicons-plus-circle', label: 'เพิ่มบ้าน' },
  { to: '/admin/tenants', icon: 'i-heroicons-user-plus', label: 'เพิ่มผู้เช่า' },
  { to: '/admin/contracts', icon: 'i-heroicons-document-plus', label: 'สัญญาใหม่' },
  { to: '/admin/payments', icon: 'i-heroicons-currency-dollar', label: 'บันทึกจ่าย' },
]

const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH')
</script>

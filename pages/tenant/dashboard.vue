<template>
  <div>
    <!-- Welcome -->
    <UCard class="mb-5" :ui="{ base: 'overflow-hidden', body: { padding: 'p-5' } }">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs text-gray-400 mb-0.5">ยินดีต้อนรับกลับ</p>
          <h2 class="text-lg font-bold text-gray-900">{{ tenantDashboard?.contract?.tenantName || userName }} 👋</h2>
          <p class="text-sm text-gray-500 mt-1">{{ formatDate(new Date().toISOString()) }}</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
          <UIcon name="i-heroicons-user-circle" class="text-green-500 text-2xl" />
        </div>
      </div>
    </UCard>
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-2xl text-primary"
      />
    </div>

    <!-- Contract Info -->
    <div v-else-if="contract">
      <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">ข้อมูลการเช่า</h3>

      <UCard class="mb-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-home-modern" class="text-blue-500" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-900">{{ contract.houseName }}</p>
            <p class="text-xs text-gray-400 mt-0.5">สัญญา #{{ contract.id }}</p>
          </div>
          <UBadge :label="contractStatusLabel[contract.status]" :color="contractStatusColor[contract.status]" variant="subtle" />
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-400">ค่าเช่า/เดือน</p>
            <p class="text-base font-bold text-gray-900 mt-0.5">฿{{ contract.monthlyRent.toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-400">สัญญาสิ้นสุด</p>
            <p class="text-base font-bold text-gray-900 mt-0.5">{{ formatDate(contract.endDate) }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-400">เริ่มเช่า</p>
            <p class="text-sm font-medium text-gray-700 mt-0.5">{{ formatDate(contract.startDate) }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-400">คงเหลือ</p>
            <p class="text-sm font-medium mt-0.5" :class="daysLeft < 30 ? 'text-red-500' : 'text-gray-700'">
              {{ daysLeft }} วัน
            </p>
          </div>
        </div>
      </UCard>

      <!-- Next payment -->
      <UCard v-if="nextPayment">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="nextPayment.status === 2 ? 'bg-red-50' : 'bg-amber-50'"
            >
              <UIcon name="i-heroicons-banknotes"
                :class="nextPayment.status === 2 ? 'text-red-500' : 'text-amber-500'"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800">
                {{ nextPayment.status === 2 ? '⚠️ ค้างชำระ' : 'ค่าเช่างวดถัดไป' }}
              </p>
              <p class="text-xs text-gray-400">ครบกำหนด {{ formatDate(nextPayment.dueDate) }}</p>
            </div>
          </div>
          <p class="text-lg font-bold" :class="nextPayment.status === 2 ? 'text-red-600' : 'text-gray-900'">
            ฿{{ nextPayment.amount.toLocaleString() }}
          </p>
        </div>
      </UCard>

       <!-- <UAlert
        v-else
        color="green"
        variant="subtle"
        icon="i-heroicons-check-circle"
        title="ไม่มีรายการที่ต้องชำระ"
        description="คุณชำระค่าเช่าครบทุกงวดแล้ว"
      /> -->

      <!-- Quick actions -->
      <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">เมนูด่วน</h3>
      <div class="grid grid-cols-2 gap-3">
        <NuxtLink to="/tenant/payments">
          <UCard class="cursor-pointer hover:border-primary-300 transition-colors" :ui="{ body: { padding: 'p-4' } }">
            <div class="flex flex-col items-center text-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <UIcon name="i-heroicons-clock" class="text-blue-500" />
              </div>
              <p class="text-sm font-medium text-gray-700">ประวัติชำระ</p>
            </div>
          </UCard>
        </NuxtLink>
        <NuxtLink to="/tenant/maintenance">
          <UCard class="cursor-pointer hover:border-primary-300 transition-colors" :ui="{ body: { padding: 'p-4' } }">
            <div class="flex flex-col items-center text-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <UIcon name="i-heroicons-wrench-screwdriver" class="text-amber-500" />
              </div>
              <p class="text-sm font-medium text-gray-700">แจ้งซ่อม</p>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="text-center py-16 text-gray-400">
      <UIcon name="i-heroicons-home" class="text-5xl mb-3" />
      <p>ยังไม่มีสัญญาเช่า</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboard } from '~/composables/useDashboard'

definePageMeta({ middleware: 'auth', layout: 'tenant' })

const {
  tenantDashboard,
  loading,
  fetchTenantDashboard
} = useDashboard()

const contract = computed(
  () => tenantDashboard.value?.contract
)

const nextPayment = computed(
  () => tenantDashboard.value?.nextPayment
)

const { userName } = useAuth()


const contractStatusLabel: Record<number, string> = {
  0: 'กำลังเช่า',
  1: 'หมดสัญญา',
  2: 'ยกเลิก'
}

const contractStatusColor: Record<number, any> = {
  0: 'green',
  1: 'gray',
  2: 'red'
}

const daysLeft = computed(() => {
  if (!contract.value)
    return 0

  const diff =
    new Date(contract.value.endDate).getTime() -
    Date.now()

  return Math.max(
    0,
    Math.ceil(diff / 86400000)
  )
})

const formatDate = (date?: string) => {
  if (!date) return '-'

  return new Date(date).toLocaleDateString(
    'th-TH',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  )
}

onMounted(async () => {
  await fetchTenantDashboard()
})
</script>

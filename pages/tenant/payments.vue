<template>
  <div>
    <h2 class="text-base font-semibold text-gray-800 mb-5">ประวัติการชำระเงิน</h2>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-gray-400" />
    </div>

    <div v-else-if="payments.length === 0" class="text-center py-16 text-gray-400">
      <UIcon name="i-heroicons-banknotes" class="text-5xl mb-3" />
      <p>ยังไม่มีประวัติการชำระ</p>
    </div>

    <div v-else class="space-y-3">
      <!-- Summary -->
      <div class="grid grid-cols-3 gap-3 mb-5">
        <UCard :ui="{ body: { padding: 'p-3' } }">
          <p class="text-xs text-gray-400 mb-1">ชำระแล้ว</p>
          <p class="text-xl font-bold text-green-600">{{ paidCount }}</p>
          <p class="text-xs text-gray-400">รายการ</p>
        </UCard>
        <UCard :ui="{ body: { padding: 'p-3' } }">
          <p class="text-xs text-gray-400 mb-1">รอชำระ</p>
          <p class="text-xl font-bold text-amber-500">{{ pendingCount }}</p>
          <p class="text-xs text-gray-400">รายการ</p>
        </UCard>
        <UCard :ui="{ body: { padding: 'p-3' } }">
          <p class="text-xs text-gray-400 mb-1">ค้างชำระ</p>
          <p class="text-xl font-bold text-red-600">{{ overdueCount }}</p>
          <p class="text-xs text-gray-400">รายการ</p>
        </UCard>
      </div>

      <!-- Payment list -->
      <UCard
        v-for="p in payments"
        :key="p.id"
        :ui="{ body: { padding: 'p-4' } }"
        :class="p.status === 2 ? 'border-red-200' : ''"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="{
                'bg-green-50': p.status === 1,
                'bg-amber-50': p.status === 0,
                'bg-red-50': p.status === 2
              }"
            >
              <UIcon
                :name="p.status === 1 ? 'i-heroicons-check-circle' : p.status === 2 ? 'i-heroicons-exclamation-circle' : 'i-heroicons-clock'"
                :class="{
                  'text-green-500': p.status === 1,
                  'text-amber-500': p.status === 0,
                  'text-red-500': p.status === 2
                }"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800">ค่าเช่าประจำเดือน</p>
              <p class="text-xs text-gray-400">
                ครบกำหนด {{ formatDate(p.dueDate) }}
                <span v-if="p.paidDate"> · ชำระ {{ formatDate(p.paidDate) }}</span>
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold" :class="p.status === 2 ? 'text-red-600' : 'text-gray-900'">
              ฿{{ p.amount.toLocaleString() }}
            </p>
            <UBadge :label="statusLabel[p.status]" :color="statusColor[p.status]" variant="subtle" size="xs" class="mt-1" />
            <!-- <UButton
              v-if="p.status === 0"
              size="xs"
              color="primary"
              variant="solid"
              class="mt-2"
              icon="i-heroicons-banknotes"
              @click="goPayment(p.id)"
            >
              ชำระเงิน
            </UButton> -->
          </div>
        </div>
        <div v-if="p.note" class="mt-2 text-xs text-gray-400 bg-gray-50 rounded px-3 py-1.5">
          {{ p.note }}
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Payment } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'tenant' })

const {
  payments,
  loading,
  fetchMyPayments
} = usePayments()

const statusLabel: Record<number, string> = {
  0: 'รอชำระ',
  1: 'ชำระแล้ว',
  2: 'ค้างชำระ'
}

const statusColor: Record<number, any> = {
  0: 'yellow',
  1: 'green',
  2: 'red'
}

const paidCount = computed(() =>
  payments.value.filter(x => x.status === 1).length
)

const pendingCount = computed(() =>
  payments.value.filter(x => x.status === 0).length
)

const overdueCount = computed(() =>
  payments.value.filter(x => x.status === 2).length
)

const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })


onMounted(async () => {
  await fetchMyPayments()
})

</script>

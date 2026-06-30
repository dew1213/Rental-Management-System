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
        :class="p.status === 'Overdue' ? 'border-red-200' : ''"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="{
                'bg-green-50': p.status === 'Paid',
                'bg-amber-50': p.status === 'Pending',
                'bg-red-50': p.status === 'Overdue'
              }"
            >
              <UIcon
                :name="p.status === 'Paid' ? 'i-heroicons-check-circle' : p.status === 'Overdue' ? 'i-heroicons-exclamation-circle' : 'i-heroicons-clock'"
                :class="{
                  'text-green-500': p.status === 'Paid',
                  'text-amber-500': p.status === 'Pending',
                  'text-red-500': p.status === 'Overdue'
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
            <p class="text-sm font-bold" :class="p.status === 'Overdue' ? 'text-red-600' : 'text-gray-900'">
              ฿{{ p.amount.toLocaleString() }}
            </p>
            <UBadge :label="statusLabel[p.status]" :color="statusColor[p.status]" variant="subtle" size="xs" class="mt-1" />
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

const { $api } = useApi()

const payments = ref<Payment[]>([])
const loading = ref(false)

const statusLabel: Record<string, string> = { Pending: 'รอชำระ', Paid: 'ชำระแล้ว', Overdue: 'ค้างชำระ' }
const statusColor: Record<string, any> = { Pending: 'yellow', Paid: 'green', Overdue: 'red' }

const paidCount = computed(() => payments.value.filter(p => p.status === 'Paid').length)
const pendingCount = computed(() => payments.value.filter(p => p.status === 'Pending').length)
const overdueCount = computed(() => payments.value.filter(p => p.status === 'Overdue').length)

const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })

onMounted(async () => {
  loading.value = true
  try {
    payments.value = await $api<Payment[]>('/payments/contract/3')
  } catch {
    payments.value = [
      { id: 1, contractId: 3, amount: 7500, dueDate: '2024-10-01', paidDate: '2024-10-01', status: 'Paid', note: 'โอนผ่าน PromptPay' },
      { id: 2, contractId: 3, amount: 7500, dueDate: '2024-11-01', paidDate: '2024-11-03', status: 'Paid' },
      { id: 3, contractId: 3, amount: 7500, dueDate: '2024-12-01', status: 'Overdue' },
      { id: 4, contractId: 3, amount: 7500, dueDate: '2025-01-01', status: 'Pending' },
    ]
  } finally {
    loading.value = false
  }
})
</script>

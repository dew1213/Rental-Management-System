<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-base font-semibold text-gray-800">การชำระเงิน</h2>
      <UBadge v-if="overdueCount > 0" :label="`ค้างชำระ ${overdueCount} รายการ`" color="red" />
    </div>

    <UTabs :items="tabs" v-model="activeTab" class="mb-4" />

    <UCard :ui="{ body: { padding: '' } }">
      <UTable :rows="tableRows" :columns="columns" :loading="loading">
        <template #status-data="{ row }">
          <UBadge :label="statusLabel[row.status]" :color="statusColor[row.status]" variant="subtle" />
        </template>
        <template #amount-data="{ row }">
          <span class="font-medium">฿{{ row.amount.toLocaleString() }}</span>
        </template>
        <template #dueDate-data="{ row }">
          <span class="text-sm">{{ formatDate(row.dueDate) }}</span>
        </template>
        <template #paidDate-data="{ row }">
          <span class="text-sm text-gray-400">{{ row.paidDate ? formatDate(row.paidDate) : '-' }}</span>
        </template>
        <template #actions-data="{ row }">
          <UButton
            v-if="row.status !== 1"
            icon="i-heroicons-check-circle"
            label="รับชำระ"
            size="xs"
            color="green"
            variant="soft"
            @click="openPayModal(row)"
          />
        </template>
      </UTable>
    </UCard>

    <!-- Pay modal -->
    <UModal v-model="payModal">
      <UCard>
        <template #header>
          <h3 class="text-sm font-semibold">บันทึกการชำระเงิน</h3>
        </template>
        <div class="space-y-3">
          <div class="bg-gray-50 rounded-lg p-3 text-sm">
            <p class="text-gray-500 text-xs mb-1">ยอดชำระ</p>
            <p class="text-xl font-bold text-gray-900">฿{{ selectedPayment?.amount.toLocaleString() }}</p>
          </div>
          <UFormGroup label="วันที่รับชำระ">
            <UInput v-model="payDate" type="date" />
          </UFormGroup>
          <UFormGroup label="หมายเหตุ (ถ้ามี)">
            <UInput v-model="payNote" placeholder="โอนผ่าน PromptPay..." />
          </UFormGroup>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" label="ยกเลิก" @click="payModal = false" />
            <UButton color="green" label="ยืนยันรับชำระ" :loading="saving" @click="confirmPay" />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Payment } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'admin' })

const {
  payments,
  loading,
  fetchPayments,
  markAsPaid
} = usePayments()

const toast = useToast()


const activeTab = ref(0)
const payModal = ref(false)
const saving = ref(false)
const selectedPayment = ref<Payment | null>(null)
const payDate = ref(new Date().toISOString().slice(0, 10))
const payNote = ref('')

const tabs = [
  { label: 'ทั้งหมด', icon: 'i-heroicons-list-bullet' },
  { label: 'ค้างชำระ', icon: 'i-heroicons-exclamation-triangle' },
  { label: 'ชำระแล้ว', icon: 'i-heroicons-check-circle' },
]

const statusLabel : Record<number, string> = {
  0: 'รอชำระ',
  1: 'ชำระแล้ว',
  2: 'ค้างชำระ'
}

const statusColor :Record<number, any>= {
  0: 'yellow',
  1: 'green',
  2: 'red'
}
const columns = [
  { key: 'contractId', label: 'สัญญา #' },
  { key: 'amount', label: 'จำนวนเงิน' },
  { key: 'dueDate', label: 'ครบกำหนด' },
  { key: 'paidDate', label: 'วันที่ชำระ' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: '' },
]

const overdueCount = computed(() =>
  payments.value.filter(p => p.status === 2).length
)

const tableRows = computed(() => {
  if (activeTab.value === 1)
    return payments.value.filter(p => p.status === 2)

  if (activeTab.value === 2)
    return payments.value.filter(p => p.status === 1)

  return payments.value
})

const openPayModal = (p: Payment) => {
  selectedPayment.value = p
  payDate.value = new Date().toISOString().slice(0, 10)
  payNote.value = ''
  payModal.value = true
}

const confirmPay = async () => {
  if (!selectedPayment.value) return

  saving.value = true

  try {
    await markAsPaid(
      selectedPayment.value.id,
      {
        paidDate: payDate.value,
        note: payNote.value
      }
    )

    toast.add({
      title: 'บันทึกการชำระสำเร็จ',
      color: 'green'
    })

    payModal.value = false
  }
  catch {
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      color: 'red'
    })
  }
  finally {
    saving.value = false
  }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH')

onMounted(async () => {
  await fetchPayments()
})

</script>

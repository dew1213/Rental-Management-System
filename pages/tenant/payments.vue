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
        :class="{
          'border-red-200': p.status === 2,
          'border-blue-200': p.status === 3
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="{
                'bg-green-50': p.status === 1,
                'bg-amber-50': p.status === 0,
                'bg-red-50': p.status === 2,
                'bg-blue-50': p.status === 3
              }"
            >
              <UIcon
                :name="
                  p.status === 1
                    ? 'i-heroicons-check-circle'
                    : p.status === 2
                      ? 'i-heroicons-exclamation-circle'
                      : p.status === 3
                        ? 'i-heroicons-arrow-path'
                        : 'i-heroicons-clock'
                "
                :class="{
                  'text-green-500': p.status === 1,
                  'text-red-500': p.status === 2,
                  'text-blue-500': p.status === 3,
                  'text-amber-500': p.status === 0
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
            <UBadge :label="statusLabel[p.status]" :color="statusColor[p.status]" variant="subtle" size="xs" class="mt-1 mr-3" />
            
            <UButton
              v-if="p.status === 0 || p.status === 2"
              size="xs"
              color="primary"
              variant="solid"
              class="mt-2"
              icon="i-heroicons-banknotes"
              @click="openUploadModal(p)"
            >
              ชำระเงิน
            </UButton>
          </div>
        </div>
        <div v-if="p.note" class="mt-2 text-xs text-gray-400 bg-gray-50 rounded px-3 py-1.5">
          {{ p.note }}
        </div>
        <div
          v-if="p.status === 3"
          class="mt-2 text-xs text-blue-600 bg-blue-50 rounded px-3 py-2"
        >
          ส่งสลิปแล้ว กำลังรอผู้ดูแลตรวจสอบ
        </div>
      </UCard>
    </div>

    <UModal v-model="uploadModal">
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            ชำระเงิน
          </h3>
        </template>

        <div class="space-y-4">

          <div class="bg-gray-50 rounded p-3">
            <p class="text-sm text-gray-500">
              จำนวนเงิน
            </p>

            <p class="text-2xl font-bold">
              ฿{{ selectedPayment?.amount.toLocaleString() }}
            </p>
          </div>

          <UFormGroup label="แนบสลิป">
            <UInput
              type="file"
              accept="image/*"
              @change="onFileChange"
            />
          </UFormGroup>

          <UFormGroup label="หมายเหตุ">
            <UTextarea
              v-model="note"
            />
          </UFormGroup>

        </div>

        <template #footer>

          <div class="flex justify-end gap-2">

            <UButton
              color="gray"
              variant="ghost"
              @click="uploadModal=false"
            >
              ยกเลิก
            </UButton>

            <UButton
              color="primary"
              :loading="uploading"
              @click="submitPayment"
            >
              ส่งสลิป
            </UButton>

          </div>

        </template>

      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Payment } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'tenant' })

const {
  payments,
  loading,
  fetchMyPayments,
  uploadSlip 
} = usePayments()
const toast = useToast()
const uploadModal = ref(false)
const slipFile = ref<File | null>(null)
const selectedPayment = ref<Payment | null>(null)

const uploading = ref(false)


const note = ref('')
const statusLabel = {
  0: 'รอชำระ',
  1: 'ชำระแล้ว',
  2: 'ค้างชำระ',
  3: 'รอตรวจสอบ'
}

const statusColor = {
  0: 'yellow',
  1: 'green',
  2: 'red',
  3: 'blue'
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

const openUploadModal = (payment: Payment) => {
  selectedPayment.value = payment
  slipFile.value = null
  note.value = ''
  uploadModal.value = true
}

const onFileChange = (files: FileList | File[] | null) => {
  if (!files) return

  if (files instanceof FileList) {
    slipFile.value = files[0] ?? null
  } else {
    slipFile.value = files[0] ?? null
  }
}
const submitPayment = async () => {

  if (!selectedPayment.value || !slipFile.value) {
    toast.add({
      title: 'กรุณาเลือกสลิป',
      color: 'red'
    })
    return
  }

  uploading.value = true
  try {
    console.log(slipFile.value)
    await uploadSlip(
      selectedPayment.value.id,
      slipFile.value,
      note.value
    )

    toast.add({
      title: 'ส่งสลิปเรียบร้อย',
      color: 'green'
    })

    uploadModal.value = false

    await fetchMyPayments()

  } finally {

    uploading.value = false

  }
}

onMounted(async () => {
  await fetchMyPayments()
})

</script>

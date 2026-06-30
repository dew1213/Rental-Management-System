<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-base font-semibold text-gray-800">แจ้งซ่อมบำรุง</h2>
      <UBadge :label="`รอดำเนินการ ${pendingCount}`" color="amber" />
    </div>

    <UCard :ui="{ body: { padding: '' } }">
      <UTable :rows="requests" :columns="columns" :loading="loading">
        <template #status-data="{ row }">
          <UBadge :label="statusLabel[row.status]" :color="statusColor[row.status]" variant="subtle" />
        </template>
        <template #createdAt-data="{ row }">
          <span class="text-xs text-gray-400">{{ formatDate(row.createdAt) }}</span>
        </template>
        <template #actions-data="{ row }">
          <USelect
            :model-value="row.status"
            :options="statusOptions"
            size="xs"
            class="w-32"
            @update:model-value="(val: string) => updateStatus(row.id, val)"
          />
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { MaintenanceRequest } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'admin' })

const { $api } = useApi()
const toast = useToast()

const requests = ref<MaintenanceRequest[]>([])
const loading = ref(false)

const statusLabel: Record<string, string> = { Pending: 'รอดำเนินการ', InProgress: 'กำลังซ่อม', Completed: 'เสร็จแล้ว' }
const statusColor: Record<string, any> = { Pending: 'yellow', InProgress: 'blue', Completed: 'green' }
const statusOptions = ['Pending', 'InProgress', 'Completed']

const columns = [
  { key: 'title', label: 'หัวข้อ' },
  { key: 'description', label: 'รายละเอียด' },
  { key: 'contractId', label: 'สัญญา #' },
  { key: 'status', label: 'สถานะ' },
  { key: 'createdAt', label: 'วันที่แจ้ง' },
  { key: 'actions', label: 'อัปเดต' },
]

const pendingCount = computed(() => requests.value.filter(r => r.status === 'Pending').length)

const updateStatus = async (id: number, status: string) => {
  try {
    const updated = await $api<MaintenanceRequest>(`/maintenance/${id}/status?status=${status}`, { method: 'PUT' })
    const idx = requests.value.findIndex(r => r.id === id)
    if (idx !== -1) requests.value[idx] = updated
    toast.add({ title: 'อัปเดตสถานะแล้ว', color: 'green' })
  } catch { toast.add({ title: 'เกิดข้อผิดพลาด', color: 'red' }) }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH')

onMounted(async () => {
  loading.value = true
  try { requests.value = await $api<MaintenanceRequest[]>('/maintenance') }
  finally { loading.value = false }
})
</script>

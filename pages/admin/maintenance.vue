<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-base font-semibold text-gray-800">แจ้งซ่อมบำรุง</h2>
      <UBadge :label="`รอดำเนินการ ${pendingCount}`" color="amber" />
    </div>

    <UCard :ui="{ body: { padding: '' } }">
      <UTable :rows="maintenances" :columns="columns" :loading="loading">
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
            option-attribute="label"
            value-attribute="value"
            size="xs"
            class="w-32"
            @update:model-value="(val: number) => onUpdateStatus(row.id, val)"
          />
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { MaintenanceRequest } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'admin' })

const {
    maintenances,
    loading,
    fetchMaintenances,
    updateStatus
} = useMaintenances()

const toast = useToast()

const statusLabel:Record<number, string> = {0: 'รอดำเนินการ', 1: 'กำลังซ่อม', 2: 'เสร็จแล้ว'}

const statusColor: Record<number, any>  = { 0: 'yellow', 1: 'blue', 2: 'green'}
const statusOptions = [ { label: 'รอดำเนินการ', value: 0 }, { label: 'กำลังซ่อม', value: 1 },{ label: 'เสร็จแล้ว', value: 2 }]

const columns = [
  { key: 'title', label: 'หัวข้อ' },
  { key: 'description', label: 'รายละเอียด' },
  { key: 'contractId', label: 'สัญญา #' },
  { key: 'status', label: 'สถานะ' },
  { key: 'createdAt', label: 'วันที่แจ้ง' },
  { key: 'actions', label: 'อัปเดต' },
]

const pendingCount = computed(() =>maintenances.value.filter(x => x.status === 0).length)

const onUpdateStatus = async (id: number, status: number) => {
  try {
    await updateStatus(id, {status: Number(status)})
    await fetchMaintenances()
    toast.add({
      title: 'อัปเดตสถานะแล้ว',
      color: 'green'
    })
  } catch {
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      color: 'red'
    })
  }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH')

onMounted(async () => {
  await fetchMaintenances()
})
</script>

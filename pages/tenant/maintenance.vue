<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-base font-semibold text-gray-800">แจ้งซ่อมบำรุง</h2>
      <UButton icon="i-heroicons-plus" label="แจ้งซ่อมใหม่" size="sm" @click="isOpen = true" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-gray-400" />
    </div>

    <div v-else-if="maintenances.length === 0" class="text-center py-16">
      <UIcon name="i-heroicons-wrench-screwdriver" class="text-5xl text-gray-300 mb-3" />
      <p class="text-gray-400 text-sm">ยังไม่มีรายการแจ้งซ่อม</p>
      <UButton label="แจ้งซ่อมครั้งแรก" class="mt-3" size="sm" @click="isOpen = true" />
    </div>

    <div v-else class="space-y-3">
      <UCard v-for="r in maintenances" :key="r.id" :ui="{ body: { padding: 'p-4' } }">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            :class="{
              'bg-amber-50': r.status === 0,
              'bg-blue-50': r.status === 1,
              'bg-green-50': r.status === 2,
            }"
          >
            <UIcon
              :name="r.status === 2 ? 'i-heroicons-check-circle' : r.status === 1 ? 'i-heroicons-arrow-path' : 'i-heroicons-wrench-screwdriver'"
              :class="{
                'text-amber-500': r.status === 0,
                'text-blue-500': r.status === 1,
                'text-green-500': r.status === 2,
              }"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-gray-800 truncate">{{ r.title }}</p>
              <UBadge :label="statusLabel[r.status]" :color="statusColor[r.status]" variant="subtle" size="xs" class="flex-shrink-0" />
            </div>
            <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ r.description }}</p>
            <p class="text-xs text-gray-300 mt-1.5">แจ้งเมื่อ {{ formatDate(r.createdAt) }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Create modal -->
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold">แจ้งซ่อมบำรุง</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" size="xs" @click="isOpen = false" />
          </div>
        </template>
        <UForm :state="form" @submit="onSubmit" class="space-y-4">
          <UFormGroup label="หัวข้อ" required>
            <UInput v-model="form.title" placeholder="เช่น น้ำรั่ว, แอร์เสีย..." />
          </UFormGroup>
          <UFormGroup label="รายละเอียด" required>
            <UTextarea v-model="form.description" placeholder="อธิบายปัญหาที่พบ..." rows="4" />
          </UFormGroup>
          <UAlert color="blue" variant="subtle" icon="i-heroicons-information-circle"
            description="ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมงหลังได้รับแจ้ง" />
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" label="ยกเลิก" @click="isOpen = false" />
            <UButton type="submit" :loading="saving" label="ส่งแจ้งซ่อม" />
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { CreateMaintenanceRequest } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'tenant' })

const {  maintenances, loading, fetchMyMaintenances, createMaintenance} = useMaintenances()

const toast = useToast()

const isOpen = ref(false)
const saving = ref(false)

const form = reactive<CreateMaintenanceRequest>({
  contractId: 3,
  title: '',
  description: ''
})

const statusLabel: Record<number, string> = {
  0: 'รอดำเนินการ',
  1: 'กำลังซ่อม',
  2: 'เสร็จแล้ว'
}

const statusColor: Record<number, any> = {
  0: 'yellow',
  1: 'blue',
  2: 'green'
}

const onSubmit = async () => {
  saving.value = true

  try {
    await createMaintenance(form)

    toast.add({
      title: 'ส่งแจ้งซ่อมสำเร็จ',
      color: 'green'
    })

    isOpen.value = false

    Object.assign(form, {
      contractId: 3,
      title: '',
      description: ''
    })
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

const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { dateStyle: 'medium' })

onMounted(async () => {
  await fetchMyMaintenances()
})
</script>

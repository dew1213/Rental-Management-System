<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-base font-semibold text-gray-800">รายการบ้าน</h2>
        <p class="text-xs text-gray-400">ทั้งหมด {{ houses.length }} หลัง</p>
      </div>
      <UButton icon="i-heroicons-plus" label="เพิ่มบ้าน" @click="openModal()" />
    </div>

    <!-- Filter -->
    <div class="flex gap-3 mb-4">
      <UInput v-model="search" placeholder="ค้นหาชื่อ, ที่อยู่..." icon="i-heroicons-magnifying-glass" class="max-w-xs" />
      <USelect  v-model="filterStatus"  :options="filterStatusOptions"  option-attribute="label"  value-attribute="value"  class="w-36"/>
    </div>

    <!-- Table -->
    <UCard :ui="{ body: { padding: '' } }">
      <UTable :rows="filteredHouses" :columns="columns" :loading="loading">
        <template #status-data="{ row }">
          <UBadge :label="statusLabel[row.status]" :color="statusColor[row.status]" variant="subtle" />
        </template>
        <template #monthlyRent-data="{ row }">
          <span class="font-medium">฿{{ row.monthlyRent.toLocaleString() }}</span>
        </template>
        <template #actions-data="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-heroicons-pencil-square" variant="ghost" size="xs" color="gray" @click="openModal(row)" />
            <UButton icon="i-heroicons-trash" variant="ghost" size="xs" color="red" @click="confirmDelete(row)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Modal -->
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold">{{ editTarget ? 'แก้ไขบ้าน' : 'เพิ่มบ้านใหม่' }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" size="xs" @click="isOpen = false" />
          </div>
        </template>

        <UForm :state="form" @submit="onSubmit" class="space-y-4">
          <UFormGroup label="ชื่อบ้าน" required>
            <UInput v-model="form.name" placeholder="บ้านหลังที่ 1" />
          </UFormGroup>
          <UFormGroup label="ที่อยู่" required>
            <UTextarea v-model="form.address" placeholder="123 ถ.สุขุมวิท..." rows="2" />
          </UFormGroup>
          <UFormGroup label="ค่าเช่า/เดือน (บาท)" required>
            <UInput v-model.number="form.monthlyRent" type="number" placeholder="5000" />
          </UFormGroup>
          <UFormGroup v-if="editTarget" label="สถานะ">
            <USelect v-model="form.status" :options="statusOptions" option-attribute="label"  value-attribute="value" />
          </UFormGroup>

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="gray" label="ยกเลิก" @click="isOpen = false" />
            <UButton type="submit" :loading="saving" :label="editTarget ? 'บันทึก' : 'เพิ่มบ้าน'" />
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- Confirm delete -->
    <UModal v-model="deleteConfirm">
      <UCard>
        <template #header>
          <h3 class="text-sm font-semibold text-red-600">ยืนยันการลบ</h3>
        </template>
        <p class="text-sm text-gray-600">คุณต้องการลบบ้าน <strong>{{ deleteTarget?.name }}</strong> ใช่หรือไม่?</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" label="ยกเลิก" @click="deleteConfirm = false" />
            <UButton color="red" label="ลบ" :loading="saving" @click="onDelete" />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { House } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'admin' })

const { houses, loading, fetchHouses, createHouse, updateHouse, deleteHouse } = useHouses()
const toast = useToast()

const search = ref('')
const filterStatus = ref<number | 'all'>('all')
const isOpen = ref(false)
const deleteConfirm = ref(false)
const saving = ref(false)
const editTarget = ref<House | null>(null)
const deleteTarget = ref<House | null>(null)

const form = reactive({ name: '', address: '', monthlyRent: 0, status: 0 })

const filterStatusOptions  = [  { label: 'ทั้งหมด', value: 'all' },{ label: 'ว่าง', value: 0 }, { label: 'เช่าแล้ว', value: 1 },{ label: 'ซ่อมบำรุง', value: 2 }]
const statusOptions = [{ label: 'ว่าง', value: 0 },{ label: 'เช่าแล้ว', value: 1 },{ label: 'ซ่อมบำรุง', value: 2 }
]
const statusLabel: Record<string, string> = { 0: 'ว่าง', 1: 'เช่าแล้ว', 2: 'ซ่อมบำรุง' }
const statusColor: Record<string, any> = { 0: 'green', 1: 'blue', 2: 'yellow' }

const columns = [
  { key: 'name', label: 'ชื่อบ้าน' },
  { key: 'address', label: 'ที่อยู่' },
  { key: 'monthlyRent', label: 'ค่าเช่า/เดือน' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions', label: '' },
]

// const filteredHouses = computed(() => houses.value.filter(h => {
//   const matchSearch = !search.value || h.name.includes(search.value) || h.address.includes(search.value)
//   const matchStatus = filterStatus.value === 'ทั้งหมด' || h.status === filterStatus.value
//   return matchSearch && matchStatus
// }))
const filteredHouses = computed(() => {
  return houses.value.filter(h => {
    const matchSearch =
      !search.value ||
      h.name.includes(search.value) ||
      h.address.includes(search.value)

    const matchStatus =
      filterStatus.value === 'all'
        ? true
        : h.status === Number(filterStatus.value)

    return matchSearch && matchStatus
  })
})

const openModal = (house?: House) => {
  editTarget.value = house || null
  if (house) {
    Object.assign(form, { name: house.name, address: house.address, monthlyRent: house.monthlyRent, status: house.status })
  } else {
    Object.assign(form, { name: '', address: '', monthlyRent: 0, status: 0 })
  }
  isOpen.value = true
}

const confirmDelete = (house: House) => {
  deleteTarget.value = house
  deleteConfirm.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    if (editTarget.value) {
      await updateHouse(editTarget.value.id, { name: form.name, address: form.address, monthlyRent: form.monthlyRent, status: Number(form.status)})
      toast.add({ title: 'แก้ไขสำเร็จ', color: 'green' })
    } else {
      await createHouse({ name: form.name, address: form.address, monthlyRent: form.monthlyRent })
      toast.add({ title: 'เพิ่มบ้านสำเร็จ', color: 'green' })
    }
    isOpen.value = false
  } catch {
    toast.add({ title: 'เกิดข้อผิดพลาด', color: 'red' })
  } finally {
    saving.value = false
  }
}

const onDelete = async () => {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await deleteHouse(deleteTarget.value.id)
    toast.add({ title: 'ลบสำเร็จ', color: 'green' })
    deleteConfirm.value = false
  } catch {
    toast.add({ title: 'เกิดข้อผิดพลาด', color: 'red' })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchHouses()
})
</script>

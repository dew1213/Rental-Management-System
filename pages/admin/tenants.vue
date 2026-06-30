<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-base font-semibold text-gray-800">จัดการผู้เช่า</h2>
        <p class="text-xs text-gray-400">ทั้งหมด {{ tenants.length }} คน</p>
      </div>
      <UButton icon="i-heroicons-user-plus" label="เพิ่มผู้เช่า" @click="openModal()" />
    </div>

    <UInput v-model="search" placeholder="ค้นหาชื่อ, อีเมล..." icon="i-heroicons-magnifying-glass" class="max-w-xs mb-4" />

    <UCard :ui="{ body: { padding: '' } }">
      <UTable :rows="filteredTenants" :columns="columns" :loading="loading">
        <template #name-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :alt="`${row.firstName} ${row.lastName}`" size="sm" />
            <div>
              <p class="text-sm font-medium text-gray-800">{{ row.firstName }} {{ row.lastName }}</p>
              <p class="text-xs text-gray-400">{{ row.email }}</p>
            </div>
          </div>
        </template>
        <template #phone-data="{ row }">
          <span class="text-sm">{{ row.phone }}</span>
        </template>
        <template #createdAt-data="{ row }">
          <span class="text-xs text-gray-400">{{ formatDate(row.createdAt) }}</span>
        </template>
        <template #actions-data="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-heroicons-pencil-square" variant="ghost" size="xs" color="gray" @click="openModal(row)" />
            <UButton icon="i-heroicons-trash" variant="ghost" size="xs" color="red" @click="confirmDelete(row)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Modal Add/Edit -->
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold">{{ editTarget ? 'แก้ไขผู้เช่า' : 'เพิ่มผู้เช่าใหม่' }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" size="xs" @click="isOpen = false" />
          </div>
        </template>
        <UForm :state="form" @submit="onSubmit" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="ชื่อ" required>
              <UInput v-model="form.firstName" placeholder="สมชาย" />
            </UFormGroup>
            <UFormGroup label="นามสกุล" required>
              <UInput v-model="form.lastName" placeholder="ใจดี" />
            </UFormGroup>
          </div>
          <UFormGroup label="อีเมล" required>
            <UInput v-model="form.email" type="email" placeholder="somchai@email.com" />
          </UFormGroup>
          <UFormGroup label="เบอร์โทร" required>
            <UInput v-model="form.phone" placeholder="0812345678"  type="tel" maxlength="10"  />
          </UFormGroup>
          <UFormGroup v-if="!editTarget" label="รหัสผ่าน" required>
            <UInput v-model="form.password" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" />
          </UFormGroup>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="gray" label="ยกเลิก" @click="isOpen = false" />
            <UButton type="submit" :loading="saving" :label="editTarget ? 'บันทึก' : 'เพิ่มผู้เช่า'" />
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- Confirm delete -->
    <UModal v-model="deleteConfirm">
      <UCard>
        <template #header><h3 class="text-sm font-semibold text-red-600">ยืนยันการลบ</h3></template>
        <p class="text-sm text-gray-600">ลบผู้เช่า <strong>{{ deleteTarget?.firstName }} {{ deleteTarget?.lastName }}</strong> ใช่หรือไม่?</p>
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
import type { Tenant } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'admin' })

const {  tenants,loading,fetchTenants,  createTenant,  updateTenant,  deleteTenant} = useTenants()
const toast = useToast()


const search = ref('')
const isOpen = ref(false)
const deleteConfirm = ref(false)
const saving = ref(false)
const editTarget = ref<Tenant | null>(null)
const deleteTarget = ref<Tenant | null>(null)

const form = reactive({ firstName: '', lastName: '', email: '', phone: '', password: '' })

const columns = [
  { key: 'name', label: 'ชื่อ-นามสกุล' },
  { key: 'phone', label: 'เบอร์โทร' },
  { key: 'createdAt', label: 'วันที่เพิ่ม' },
  { key: 'actions', label: '' },
]

const filteredTenants = computed(() => tenants.value.filter(t =>
  !search.value ||
  `${t.firstName} ${t.lastName}`.includes(search.value) ||
  t.email.includes(search.value)
))

const openModal = (t?: Tenant) => {
  editTarget.value = t || null
  if (t) Object.assign(form, { firstName: t.firstName, lastName: t.lastName, email: t.email, phone: t.phone, password: '' })
  else Object.assign(form, { firstName: '', lastName: '', email: '', phone: '', password: '' })
  isOpen.value = true
}

const confirmDelete = (t: Tenant) => { deleteTarget.value = t; deleteConfirm.value = true }

const onSubmit = async () => {
  saving.value = true
  try {
    if (editTarget.value) {
      await updateTenant(editTarget.value.id, {  firstName: form.firstName,  lastName: form.lastName,  phone: form.phone})
    } else {
      await createTenant(form)
    }
    toast.add({ title: editTarget.value ? 'แก้ไขสำเร็จ' : 'เพิ่มผู้เช่าสำเร็จ', color: 'green' })
    isOpen.value = false
  } catch { toast.add({ title: 'เกิดข้อผิดพลาด', color: 'red' }) }
  finally { saving.value = false }
}

const onDelete = async () => {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await deleteTenant(deleteTarget.value.id)
    toast.add({ title: 'ลบสำเร็จ', color: 'green' })
    deleteConfirm.value = false
  } catch { toast.add({ title: 'เกิดข้อผิดพลาด', color: 'red' }) }
  finally { saving.value = false }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH')

onMounted(fetchTenants)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-base font-semibold text-gray-800">สัญญาเช่า</h2>
      <UButton icon="i-heroicons-document-plus" label="ออกสัญญาใหม่" @click="openModal()" />
    </div>

    <UCard :ui="{ body: { padding: '' } }">
      <UTable :rows="contracts" :columns="columns" :loading="loading">
        <template #status-data="{ row }">
          <UBadge :label="statusLabel[row.status]" :color="statusColor[row.status]" variant="subtle" />
        </template>
        <template #monthlyRent-data="{ row }">
          <span class="font-medium">฿{{ row.monthlyRent.toLocaleString() }}</span>
        </template>
        <template #startDate-data="{ row }">
          <span class="text-sm">{{ formatDate(row.startDate) }}</span>
        </template>
        <template #endDate-data="{ row }">
          <span class="text-sm">{{ formatDate(row.endDate) }}</span>
        </template>
        <template #actions-data="{ row }">
        <div class="flex gap-1">
          <UButton
            icon="i-heroicons-pencil-square"
            variant="ghost"
            size="xs"
            color="gray"
            @click="openModal(row)"
          />

          <UButton
            icon="i-heroicons-trash"
            variant="ghost"
            size="xs"
            color="red"
            @click="confirmDelete(row)"
          />
        </div>
      </template>
      </UTable>
    </UCard>

    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold">{{ editTarget ? 'แก้ไขสัญญา' : 'ออกสัญญาใหม่' }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" size="xs" @click="isOpen = false" />
          </div>
        </template>
        <UForm :state="form" @submit="onSubmit" class="space-y-3">
          <UFormGroup label="บ้าน" required>
            <USelect v-model="form.houseId" :options="houseOptions" option-attribute="label" value-attribute="value" />
          </UFormGroup>
          <UFormGroup label="ผู้เช่า" required>
            <USelect v-model="form.tenantId" :options="tenantOptions" option-attribute="label" value-attribute="value" />
          </UFormGroup>
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="วันเริ่มเช่า" required>
              <UInput v-model="form.startDate" type="date" />
            </UFormGroup>
            <UFormGroup label="วันสิ้นสุด" required>
              <UInput v-model="form.endDate" type="date" :min="form.startDate" :disabled="!form.startDate" />
            </UFormGroup>
          </div>
          <UFormGroup label="ค่าเช่า/เดือน" required>
            <UInput v-model.number="form.monthlyRent" type="number" placeholder="5000" />
          </UFormGroup>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="gray" label="ยกเลิก" @click="isOpen = false" />
            <UButton type="submit" :loading="saving" :label="editTarget ? 'บันทึก' : 'ออกสัญญา'"/>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <UModal v-model="deleteConfirm">
      <UCard>
        <template #header>
          <h3 class="text-sm font-semibold text-red-600">
            ยืนยันการลบ
          </h3>
        </template>

        <p class="text-sm">
          ต้องการลบสัญญาเลขที่
          <strong>{{ deleteTarget?.id }}</strong>
          ใช่หรือไม่?
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              color="gray"
              label="ยกเลิก"
              @click="deleteConfirm = false"
            />

            <UButton
              color="red"
              label="ลบ"
              :loading="saving"
              @click="onDelete"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">

definePageMeta({ middleware: 'auth', layout: 'admin' })
import type { Contract } from '~/types'

const {  contracts, loading, fetchContracts, createContract, updateContract, deleteContract} = useContracts()
const { houses, fetchHouses } = useHouses()
const { tenants, fetchTenants } = useTenants()

const toast = useToast()
const editTarget = ref<Contract | null>(null)
const deleteTarget = ref<Contract | null>(null)
const deleteConfirm = ref(false)

const isOpen = ref(false)
const saving = ref(false)

const houseOptions = computed(() =>
  houses.value.map(h => ({
    label: h.name,
    value: h.id
  }))
)

const tenantOptions = computed(() =>
  tenants.value.map(t => ({
    label: `${t.firstName} ${t.lastName}`,
    value: t.id
  }))
)


const form = reactive({ houseId: 0, tenantId: 0, startDate: '', endDate: '', monthlyRent: 0})

const statusLabel: Record<number, string> = {  0: 'กำลังเช่า',  1: 'หมดสัญญา',  2: 'ยกเลิก'}
const statusColor: Record<number, any> = {  0: 'green',  1: 'gray',  2: 'red'}

const columns = [
  { key: 'id', label: 'เลขที่สัญญา' },
  { key: 'houseName', label: 'บ้าน' },
  { key: 'tenantName', label: 'ผู้เช่า' },
  { key: 'monthlyRent', label: 'ค่าเช่า/เดือน' },
  { key: 'startDate', label: 'เริ่มเช่า' },
  { key: 'endDate', label: 'สิ้นสุด' },
  { key: 'status', label: 'สถานะ' },
  { key: 'actions',label:''}
]

const openModal = (contract?: Contract) => {
  editTarget.value = contract ?? null

  if (contract) {
    Object.assign(form, {
      houseId: contract.houseId,
      tenantId: contract.tenantId,
      startDate: contract.startDate.substring(0, 10),
      endDate: contract.endDate.substring(0, 10),
      monthlyRent: contract.monthlyRent
    })
  } else {
    Object.assign(form, {
      houseId: 0,
      tenantId: 0,
      startDate: '',
      endDate: '',
      monthlyRent: 0
    })
  }

  isOpen.value = true
}

const onSubmit = async () => {
  saving.value = true
  saving.value = true

  if (new Date(form.endDate) < new Date(form.startDate)) {
    toast.add({
      title: 'วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่ม',
      color: 'red'
    })

    saving.value = false
    return
  }
  try {
    if (editTarget.value) {
      await updateContract(editTarget.value.id, form)

      toast.add({
        title: 'แก้ไขสัญญาสำเร็จ',
        color: 'green'
      })
    } else {
      await createContract(form)

      toast.add({
        title: 'ออกสัญญาสำเร็จ',
        color: 'green'
      })
    }

    isOpen.value = false
    Object.assign(form, {
      houseId: 0,
      tenantId: 0,
      startDate: '',
      endDate: '',
      monthlyRent: 0
    })

    editTarget.value = null
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

const confirmDelete = (contract: Contract) => {
  deleteTarget.value = contract
  deleteConfirm.value = true
}

const onDelete = async () => {
  if (!deleteTarget.value) return

  saving.value = true

  try {
    await deleteContract(deleteTarget.value.id)

    toast.add({
      title: 'ลบสำเร็จ',
      color: 'green'
    })

    deleteConfirm.value = false
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
  await Promise.all([
    fetchContracts(),
    fetchHouses(),
    fetchTenants()
  ])
})
</script>

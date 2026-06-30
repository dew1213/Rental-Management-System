<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <div class="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-home" class="text-white text-xl" />
          </div>
          <h1 class="text-xl font-bold text-gray-900">Rental Management</h1>
          <p class="text-sm text-gray-500 mt-1">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>
      </template>

      <UTabs :items="tabs" class="mb-4" v-model="activeTab" />

      <UForm :state="form" :schema="schema" @submit="onSubmit" class="space-y-4">
        <UFormGroup label="อีเมล" name="email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            icon="i-heroicons-envelope"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="รหัสผ่าน" name="password">
          <UInput
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            placeholder="รหัสผ่าน"
            icon="i-heroicons-lock-closed"
            size="lg"
            :ui="{ trailing: { padding: { sm: 'pe-2' } } }"
          >
            <template #trailing>
              <UButton
                :icon="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                variant="link"
                color="gray"
                @click="showPass = !showPass"
              />
            </template>
          </UInput>
        </UFormGroup>

        <UAlert v-if="error" color="red" :description="error" icon="i-heroicons-exclamation-circle" />

        <UButton type="submit" block size="lg" :loading="loading" label="เข้าสู่ระบบ" />
      </UForm>

      <template #footer>
        <div class="text-center text-xs text-gray-400">
          Rental Management System &copy; {{ new Date().getFullYear() }}
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ middleware: 'guest', layout: 'default' })

const { login } = useAuth()
const config = useRuntimeConfig()

const activeTab = ref(0)
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

const tabs = [
  { label: 'Admin', icon: 'i-heroicons-shield-check' },
  { label: 'ผู้เช่า', icon: 'i-heroicons-user' },
]

const form = reactive({ email: '', password: '' })

const schema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
})

const onSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    const endpoint = activeTab.value === 0 ? '/auth/admin/login' : '/auth/tenant/login'
    const res = await $fetch<{ token: string; role: 'Admin' | 'Tenant'; name: string }>(
      `${config.public.apiBase}${endpoint}`,
      { method: 'POST', body: form }
    )
    login(res)
    await navigateTo(res.role === 'Admin' ? '/admin/dashboard' : '/tenant/dashboard')
  } catch {
    error.value = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    loading.value = false
  }
}
</script>

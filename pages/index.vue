<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { isAuthenticated, isAdmin } = useAuth()
onMounted(() => {
  if (isAuthenticated.value) navigateTo(isAdmin.value ? '/admin/dashboard' : '/tenant/dashboard')
  else navigateTo('/login')
})
</script>
<template><div /></template>

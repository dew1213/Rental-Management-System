export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, isAdmin, isTenant } = useAuth()
  if (!isAuthenticated.value) return navigateTo('/login')
  if (to.path.startsWith('/admin') && !isAdmin.value) return navigateTo('/tenant/dashboard')
  if (to.path.startsWith('/tenant') && !isTenant.value) return navigateTo('/admin/dashboard')
})

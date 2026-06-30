export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated, isAdmin } = useAuth()
  if (isAuthenticated.value) return navigateTo(isAdmin.value ? '/admin/dashboard' : '/tenant/dashboard')
})

import type { LoginResponse } from '~/types'

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', { default: () => null })
  const userRole = useCookie<string | null>('user_role', { default: () => null })
  const userName = useCookie<string | null>('user_name', { default: () => null })

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => userRole.value === 'Admin')
  const isTenant = computed(() => userRole.value === 'Tenant')

  const login = (data: LoginResponse) => {
    token.value = data.token
    userRole.value = data.role
    userName.value = data.name
  }

  const logout = () => {
    token.value = null
    userRole.value = null
    userName.value = null
    navigateTo('/login')
  }

  return { token, userRole, userName, isAuthenticated, isAdmin, isTenant, login, logout }
}

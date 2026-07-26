import type { Tenant } from '~/types'

export const useTenants = () => {
  const { $api } = useApi()

  const tenants = ref<Tenant[]>([])
  const loading = ref(false)
  const totalItems = ref(0)
  const totalPages = ref(0)
  const fetchTenants = async (
    page = 1,
    pageSize = 10,
    search = '',
    status?: number
  ) => {

    loading.value = true

    try {

      const result = await $api<any>('/tenants', {
        query: {
          page,
          pageSize,
          search,
          status
        }
      })

      tenants.value = result.items
      totalItems.value = result.totalItems
      totalPages.value = result.totalPages

    } finally {
      loading.value = false
    }
  }

  const createTenant = async (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }) => {
    const tenant = await $api<Tenant>('/tenants', {
      method: 'POST',
      body: data
    })

    tenants.value.push(tenant)
    return tenant
  }

  const updateTenant = async (
    id: number,
    data: {
      firstName: string
      lastName: string
      phone: string
    }
  ) => {
    const tenant = await $api<Tenant>(`/tenants/${id}`, {
      method: 'PUT',
      body: data
    })

    const index = tenants.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tenants.value[index] = tenant
    }

    return tenant
  }

  const deleteTenant = async (id: number) => {
    await $api(`/tenants/${id}`, {
      method: 'DELETE'
    })

    tenants.value = tenants.value.filter(t => t.id !== id)
  }

  const fetchAvailableTenants = async () => {
      loading.value = true
      try {
        tenants.value = await $api<Tenant[]>('/tenants/available')
      } finally {
        loading.value = false
      }
    }

  return {
    tenants,
    loading,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    fetchAvailableTenants,
    totalItems,
    totalPages
  }
}
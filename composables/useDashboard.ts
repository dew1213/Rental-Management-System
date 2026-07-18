import type {
  DashboardStats,
  TenantDashboard
} from '~/types'

export const useDashboard = () => {
  const { $api } = useApi()

  const adminDashboard = useState<DashboardStats | null>(
    'admin-dashboard',
    () => null
  )

  const tenantDashboard = useState<TenantDashboard | null>(
    'tenant-dashboard',
    () => null
  )

  const loading = ref(false)

  const fetchAdminDashboard = async () => {
    loading.value = true

    try {
      adminDashboard.value =
        await $api<DashboardStats>('/Dashboard/AdminDashboard')
    }
    finally {
      loading.value = false
    }
  }

  const fetchTenantDashboard = async () => {
    loading.value = true

    try {
      tenantDashboard.value =
        await $api<TenantDashboard>('/Dashboard/TenantDashboard')
    }
    finally {
      loading.value = false
    }
  }

  return {
    adminDashboard,
    tenantDashboard,
    loading,
    fetchAdminDashboard,
    fetchTenantDashboard
  }
}
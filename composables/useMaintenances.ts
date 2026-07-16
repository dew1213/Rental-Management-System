import type {
  MaintenanceRequest,
  UpdateMaintenanceStatusRequest,
  CreateMaintenanceRequest
} from '~/types'

export const useMaintenances = () => {
  const { $api } = useApi()

  const maintenances = useState<MaintenanceRequest[]>(
    'maintenances',
    () => []
  )

  const loading = ref(false)

  //admin
  const fetchMaintenances = async () => {
    loading.value = true
    try {
      maintenances.value =
        await $api('/maintenance')
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async (
    id: number,
    body: UpdateMaintenanceStatusRequest
  ) => {
    const updated =
      await $api<MaintenanceRequest>(
        `/maintenance/${id}/status`,
        {
          method: 'PUT',
          body
        }
      )

    const index =
      maintenances.value.findIndex(x => x.id === id)

    if (index !== -1)
      maintenances.value[index] = updated

    return updated
  }

    // Tenant

   const fetchMyMaintenances = async () => {
    loading.value = true

    try {
      maintenances.value =
        await $api<MaintenanceRequest[]>('/maintenance/my')
    } finally {
      loading.value = false
    }
  }

  const createMaintenance = async (
    body: CreateMaintenanceRequest
  ) => {
    const created =
      await $api<MaintenanceRequest>(
        '/maintenance',
        {
          method: 'POST',
          body
        }
      )

    maintenances.value.unshift(created)

    return created
  }

  return {
    maintenances,
    loading,
    fetchMaintenances,
    updateStatus,
    fetchMyMaintenances,
    createMaintenance
  }
}
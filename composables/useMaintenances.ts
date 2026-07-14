import type {
  MaintenanceRequest,
  UpdateMaintenanceStatusRequest
} from '~/types'

export const useMaintenances = () => {
  const { $api } = useApi()

  const maintenances = useState<MaintenanceRequest[]>(
    'maintenances',
    () => []
  )

  const loading = ref(false)

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

  return {
    maintenances,
    loading,
    fetchMaintenances,
    updateStatus
  }
}
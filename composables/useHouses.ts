import type { House } from '~/types'
// import type { House, CreateHouseRequest } from '~/types'
export const useHouses = () => {
  const { $api } = useApi()

  const houses = ref<House[]>([])
  const loading = ref(false)
  const totalItems = ref(0)
  const totalPages = ref(0)
  const fetchHouses = async (
    page = 1,
    pageSize = 10,
    search = '',
    status?: number
  ) => {

    loading.value = true

    try {

      const result = await $api<any>('/houses', {
        query: {
          page,
          pageSize,
          search,
          status
        }
      })

      houses.value = result.items
      totalItems.value = result.totalItems
      totalPages.value = result.totalPages

    } finally {
      loading.value = false
    }
  }

  const createHouse = async (data: { name: string; address: string; monthlyRent: number }) => {
    const res = await $api<House>('/houses', { method: 'POST', body: data })
    houses.value.push(res)
    return res
  }

  const updateHouse = async (id: number, data: Partial<House>) => {
    const res = await $api<House>(`/houses/${id}`, { method: 'PUT', body: data })
    const idx = houses.value.findIndex(h => h.id === id)
    if (idx !== -1) houses.value[idx] = res
    return res
  }

  const deleteHouse = async (id: number) => {
    await $api(`/houses/${id}`, { method: 'DELETE' })
    houses.value = houses.value.filter(h => h.id !== id)
  }

  const fetchAvailableHouses = async () => {
    loading.value = true
    try {
      houses.value = await $api<House[]>('/houses/available')
    } finally {
      loading.value = false
    }
  }

  return { houses, loading, fetchHouses, createHouse, updateHouse, deleteHouse ,fetchAvailableHouses,totalItems,totalPages}
}


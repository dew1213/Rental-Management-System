import type { Contract } from '~/types'

export const useContracts = () => {
  const { $api } = useApi()

  const contracts = ref<Contract[]>([])
  const loading = ref(false)

  const fetchContracts = async () => {
    loading.value = true

    try {
      contracts.value = await $api<Contract[]>('/contracts')
    } finally {
      loading.value = false
    }
  }

  const createContract = async (data: {
    houseId: number
    tenantId: number
    startDate: string
    endDate: string
    monthlyRent: number
  }) => {
    const contract = await $api<Contract>('/contracts', {
      method: 'POST',
      body: data
    })

    contracts.value.push(contract)

    return contract
  }

  const updateContract = async (
    id: number,
    data: Partial<Contract>
  ) => {
    const contract = await $api<Contract>(`/contracts/${id}`, {
      method: 'PUT',
      body: data
    })

    const index = contracts.value.findIndex(c => c.id === id)

    if (index !== -1) {
      contracts.value[index] = contract
    }

    return contract
  }

  const deleteContract = async (id: number) => {
    await $api(`/contracts/${id}`, {
      method: 'DELETE'
    })

    contracts.value = contracts.value.filter(c => c.id !== id)
  }

  return {
    contracts,
    loading,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract
  }
}
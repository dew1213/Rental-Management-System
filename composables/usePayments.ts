import type {
  Payment,
  UpdatePaymentRequest
} from '~/types'

export const usePayments = () => {
  const { $api } = useApi()

  const payments = useState<Payment[]>(
    'payments',
    () => []
  )
  const contracts = useState<any[]>(
      'payment-contracts',
      ()=>[]
  )
  const loading = ref(false)

  const fetchPayments = async () => {
    loading.value = true

    try {
      payments.value = await $api<Payment[]>('/payments')
    } finally {
      loading.value = false
    }
  }

  const fetchActiveContracts = async ()=>{

      contracts.value=
          await $api('/contracts/active')

  }
  const createPaymentApi = async (body:any)=>{

      await $api('/payments',{

          method:'POST',

          body

      })

  }
  
  const fetchMyPayments = async () => {
    loading.value = true

    try {
      payments.value = await $api('/payments/my')
    } finally {
      loading.value = false
    }
  }

  const markAsPaid = async (
    id: number,
    data: UpdatePaymentRequest
  ) => {
    const res = await $api<Payment>(
      `/payments/${id}/pay`,
      {
        method: 'PUT',
        body: data
      }
    )

    const idx = payments.value.findIndex(
      p => p.id === id
    )

    if (idx !== -1)
      payments.value[idx] = res

    return res
  }
  
  return {
    payments,
    loading,
    fetchPayments,
    fetchMyPayments,
    markAsPaid,
    contracts,
    fetchActiveContracts,
    createPaymentApi
  }
}
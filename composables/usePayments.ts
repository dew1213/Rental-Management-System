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

  const loading = ref(false)

  const fetchPayments = async () => {
    loading.value = true

    try {
      payments.value = await $api<Payment[]>('/payments')
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
    markAsPaid
  }
}
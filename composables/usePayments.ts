import type { Payment } from '~/types'

export const usePayments = () => {
  const { $api } = useApi()

  const payments = ref<Payment[]>([])
  const overduePayments = ref<Payment[]>([])
  const loading = ref(false)

  const fetchByContract = async (contractId: number) => {
    loading.value = true
    try {
      payments.value = await $api<Payment[]>(`/payments/contract/${contractId}`)
    } finally {
      loading.value = false
    }
  }

  const fetchOverdue = async () => {
    overduePayments.value = await $api<Payment[]>('/payments/overdue')
  }

  const markAsPaid = async (id: number, paidDate: string) => {
    const res = await $api<Payment>(`/payments/${id}/pay`, {
      method: 'PUT',
      body: { paidDate, note: '' }
    })
    const idx = payments.value.findIndex(p => p.id === id)
    if (idx !== -1) payments.value[idx] = res
    return res
  }

  return { payments, overduePayments, loading, fetchByContract, fetchOverdue, markAsPaid }
}

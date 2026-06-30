export interface House {
  id: number
  name: string
  address: string
  monthlyRent: number
  status: number
  imageUrl?: string
  createdAt: string
}

export interface Tenant {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
}

export interface Contract {
  id: number
  houseId: number
  houseName: string
  tenantId: number
  tenantName: string
  startDate: string
  endDate: string
  monthlyRent: number
  status: number
}

export interface Payment {
  id: number
  contractId: number
  amount: number
  dueDate: string
  paidDate?: string
  status: 'Pending' | 'Paid' | 'Overdue'
  note?: string
}

export interface MaintenanceRequest {
  id: number
  contractId: number
  title: string
  description: string
  status: 'Pending' | 'InProgress' | 'Completed'
  createdAt: string
}

export interface LoginResponse {
  token: string
  role: 'Admin' | 'Tenant'
  name: string
}

export interface DashboardStats {
  totalHouses: number
  occupiedHouses: number
  totalTenants: number
  overduePayments: number
  monthlyRevenue: number
}

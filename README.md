# Rental Management — Nuxt 3 Frontend

Frontend สำหรับ Rental Management System พัฒนาด้วย Nuxt 3 + Nuxt UI

## Tech Stack
- **Nuxt 3** — Vue meta-framework
- **Nuxt UI** — Component library (Tailwind-based)
- **TypeScript** — Type safety
- **useFetch / $fetch** — API integration

## Pages

### Admin
| หน้า | Path |
|------|------|
| Login | `/login` |
| Dashboard | `/admin/dashboard` |
| จัดการบ้าน | `/admin/houses` |
| จัดการผู้เช่า | `/admin/tenants` |
| สัญญาเช่า | `/admin/contracts` |
| การชำระเงิน | `/admin/payments` |
| แจ้งซ่อม | `/admin/maintenance` |

### Tenant
| หน้า | Path |
|------|------|
| ภาพรวม | `/tenant/dashboard` |
| ประวัติชำระ | `/tenant/payments` |
| แจ้งซ่อม | `/tenant/maintenance` |

## Project Structure
```
├── pages/
│   ├── login.vue
│   ├── admin/
│   │   ├── dashboard.vue
│   │   ├── houses.vue
│   │   ├── tenants.vue
│   │   ├── contracts.vue
│   │   ├── payments.vue
│   │   └── maintenance.vue
│   └── tenant/
│       ├── dashboard.vue
│       ├── payments.vue
│       └── maintenance.vue
├── layouts/
│   ├── admin.vue        # Sidebar layout
│   └── tenant.vue       # Top nav layout
├── composables/
│   ├── useAuth.ts       # JWT auth state
│   ├── useApi.ts        # API client
│   ├── useHouses.ts     # House CRUD
│   ├── usecontracts.ts  # contract CRUD
│   ├── useTenant.ts     # Tenant CRUD
│   └── usePayment.ts    # Payment ops
├── middleware/
│   ├── auth.ts          # Route guard
│   └── guest.ts         # Redirect if logged in
└── types/index.ts       # TypeScript types
```

## Getting Started

```bash
# ติดตั้ง dependencies
npm install

# รัน dev server
npm run dev
# → http://localhost:3000

# Build สำหรับ production
npm run build
```

## Config

แก้ `.env` หรือ `nuxt.config.ts`:
```env
NUXT_PUBLIC_API_BASE=http://localhost:8080/api
```

## Connect กับ ASP.NET Core API

1. เปิด `docker-compose.yml` ใน backend project
2. รัน `docker-compose up`
3. รัน `npm run dev` ใน project นี้
4. Login ด้วย Admin หรือ Tenant account

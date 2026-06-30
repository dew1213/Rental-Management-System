import type { ComputedRef, MaybeRef } from 'vue'

type ComponentProps<T> = T extends new(...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
  : {}

declare module 'nuxt/app' {
  interface NuxtLayouts {
    admin: ComponentProps<typeof import("E:/projasp.net/RentalNuxt/rental-nuxt/layouts/admin.vue").default>,
    default: ComponentProps<typeof import("E:/projasp.net/RentalNuxt/rental-nuxt/layouts/default.vue").default>,
    tenant: ComponentProps<typeof import("E:/projasp.net/RentalNuxt/rental-nuxt/layouts/tenant.vue").default>,
}
  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}
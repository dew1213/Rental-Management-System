export const useApi = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  const $api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        ...(token.value
          ? { Authorization: `Bearer ${token.value}` }
          : {})
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        navigateTo('/login')
      }
    }
  })

  return { $api }
}
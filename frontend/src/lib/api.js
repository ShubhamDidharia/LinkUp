const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || ""

const normalizeBaseUrl = (baseUrl) => baseUrl.replace(/\/$/, "")

export const apiFetch = (path, options = {}) => {
  const baseUrl = API_BASE_URL ? normalizeBaseUrl(API_BASE_URL) : ""
  const requestPath = path.startsWith("/") ? path : `/${path}`
  const url = baseUrl ? `${baseUrl}${requestPath}` : requestPath

  return fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  })
}

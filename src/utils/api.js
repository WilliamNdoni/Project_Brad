const BASE_URL = import.meta.env.VITE_API_URL

export const api = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token")

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}
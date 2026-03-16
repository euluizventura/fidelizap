const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fidelizap-api-production.up.railway.app'

export async function fetchAPI(endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`)
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('API error:', err)
    return null
  }
}

export async function postAPI(endpoint, body) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('API error:', err)
    return null
  }
}

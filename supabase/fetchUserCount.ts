const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'your_anon_key'

interface SupabaseCountResponse {
  count: number
}

export async function fetchUserCount(): Promise<number | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count&limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Fetch failed:', response.statusText)
      return null
    }

    const data: SupabaseCountResponse[] = await response.json()
    return data[0]?.count ?? null
  } catch (error) {
    console.error('Error fetching user count:', error)
    return null
  }
}

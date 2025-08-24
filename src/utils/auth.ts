export async function loginWithEmail(email: string, password: string) {
  const res = await fetch("https://<your-project>.supabase.co/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": "<your-anon-key>"
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return await res.json();
}

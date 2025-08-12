export async function safeFetch(requestUrl, options) {
  try {
    const response = await fetch(requestUrl, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Request failed:', {
        url: requestUrl,
        status: response.status,
        body: errorText
      });
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error('Network error:', err.message);
    return null;
  }
}

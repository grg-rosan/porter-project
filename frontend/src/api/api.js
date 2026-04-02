const base_url = import.meta.env.VITE_BASE_URL; // e.g., http://localhost:5000

export const getAPI = async (endpoint, method, body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: "include"
  };
  if (body) options.body = JSON.stringify(body);

  try {
    // Note: The /api prefix is added here to match your backend app.use("/api/...")
    const response = await fetch(`${base_url}/api/${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API request failed');
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error, please try again");
  }
};

export const uploadAPI = async (endpoint, formData) => {
  const response = await fetch(`${base_url}/api/${endpoint}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Upload failed");
  return data;
};
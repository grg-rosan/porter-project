const base_url = import.meta.env.VITE_BASE_URL;

export const getAPI = async (endpoint, method, body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: "include"
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${base_url}/api/${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API request failed');
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error, please try again");
  }
};

// ← add this for file uploads
export const uploadAPI = async (endpoint, formData) => {
  try {
    const response = await fetch(`${base_url}/api/${endpoint}`, {
      method: "POST",
      credentials: "include",
      // ⚠️ do NOT set Content-Type — browser sets it automatically with boundary
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data;

  } catch (error) {
    throw new Error(error.message || "Network error, please try again");
  }
};
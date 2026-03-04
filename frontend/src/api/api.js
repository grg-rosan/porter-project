const base_url = import.meta.env.VITE_BASE_URL;

export const getAPI = async (endpoint, method, body = null) => {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json', // Specify content type for JSON body
    },
    credentials: "include"
  };

  if (body) {
    options.body = JSON.stringify(body); // Stringify the body for POST/PUT requests
    console.log(body)
  }

  const response = await fetch(`${base_url}/api/${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  console.log(data)
  return data;
};
const base_url = import.meta.env.VITE_BASE_URL;

export const getAPI = async (endpoint, method, body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${base_url}/api/${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;

    } catch (error) {
        // network failure, server down etc
        throw new Error(error.message || "Network error, please try again");
    }
};
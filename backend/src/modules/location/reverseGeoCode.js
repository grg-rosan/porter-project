async function reverseGeocode(lat, lng) {
    const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
            params: {
                lat,
                lon: lng,
                format: "json",
                addressdetails: 1
            },
            headers: {
                "User-Agent": "porter-app"
            }
        }
    );

    return {
        displayName: response.data.display_name,
        address: response.data.address
    };
}
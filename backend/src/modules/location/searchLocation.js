import axios from 'axios'
export async function geoCode(address){
    console.log("address received:",address)
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params:{
                    q:address,
                    format:"json",
                    addressdetails:1,
                    limit:1
                },
                headers:{
                    "User-Agent": "porter-app (your-email@example.com)"
                }
            }
        );

        if(!response.data.length){
            throw new Error("location not found");
        }

        const result = response.data[0];

        return{
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            displayName: result.display_name,
            address: result.address
        };
    }
   catch (error) {
    console.error("Full geocode error:", error.response?.data || error.message);
    throw error; // 👈 do NOT wrap it
}
}
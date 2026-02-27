import { haversine } from "../utils/harversine.js";

export function calculateDistance(pickup_address,drop_address){
    return haversine(pickup_address, drop_address)
}
import { haversine } from "../shared/utils/haversine.js";

export function calculateDistance(pickupLoc, dropLoc){
    return haversine(pickupLoc, dropLoc)
}
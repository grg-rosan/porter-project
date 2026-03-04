import { haversine } from "../shared/utils/harversine.js";

export function calculateDistance(pickupLoc, dropLoc){
    return haversine(pickupLoc, dropLoc)
}
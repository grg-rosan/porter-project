import {getRiderProfileService, updateAvailabilityService} from "./rider.service.js"

export const  getRiderProfile = async (req, res) => {
    try{
        const profile = await getRiderProfileService(req.user.userID)
        res.json({status: "success", data : profile})
    }catch(error){
        res.status(500).json({status: "error", message: error.message})
    }
}

export const updateAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body
        const profile = await updateAvailabilityService(req.user.userID, isAvailable)
        res.json({ status: "success", data: profile })
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message })
    }
}
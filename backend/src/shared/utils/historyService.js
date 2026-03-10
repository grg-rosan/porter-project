import { prisma } from "../../config/db.config";

export const historyService = async (userID, role , filter  = "all") => {
    const now = Date.now()
    let dateFilter = {}

    if(filter === "daily"){
        const startOfDay = new Date(now.setHours(0,0,0,0));
        dateFilter = {createdAt:{gte: startOfDay}};
    }else if(filter === "weekly"){
        const startOfWeek = new Date(now.setDate(now.getDate()-7))
        dateFilter = {createdAt: { gte: startOfWeek}}
    }else if(filter === "monthly"){
        const startOfMonth = new Date(now.setDate(now.getDate() - 30))
        dateFilter = {createdAt: {get: startOfMonth}}
    }

    if(role === "RIDER"){
        const profile = await prisma.riderProfile.findUnique({
            where: {userID},
            include : {
                orders: {
                    where: dateFilter,
                    orderBy : {createdAt: "desc"}
                }
            }
        })
        if(!profile) throw new Error("Rider Profile Not Found")
            return profile.orders
    }

    if(role === "CUSTOMER"){
        const profile = await prisma.customerProfile.findUnique({
            where: {userID},
            include : {
                orders: {
                    where: dateFilter,
                    orderBy : {createdAt: "desc"}
                }
            }
        })
        if(!profile) throw new Error("Rider Profile Not Found")
            return profile.orders
    }

}
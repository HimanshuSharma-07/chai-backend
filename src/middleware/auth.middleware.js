import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization"?.replace("Bearer ", ""))
    
        if (!token) {
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodeToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        
        const user = await User.findById(decodeToken?._id)
        .select("-password -refreshToken")
    
        if (!user) {
            // discuss about frontend   
            throw new ApiError(401, "Invaid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid access token")
    }


})

export {verifyJWT}
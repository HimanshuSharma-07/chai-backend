import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessandRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
        

    } catch (error) {
        throw new ApiError("Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from froentend
    // validation - not empty
    // check for images alreadty exists: username, email
    // check for images, check for avatar
    // upload them to clodinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, username, email, password } = req.body
    // console.log("email : ", email);

    if (
        [fullName, username, email, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }


    const existedUser = await   User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with  email or username already exit")
    }
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies

    const { username, email, password, } = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email are required")
    }
    if(!password){
        throw new ApiError(400, "password is required")
    }


    const findUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!findUser) {
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await findUser.isPassworCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    const {accessToken, refreshToken} = await generateAccessandRefreshTokens(findUser._id)

    const  loggedInUser = await User.findById(findUser._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Succefully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
            
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))

})

const refreshAccessToken = asyncHandler(asyncHandler(async (req, res) => {
    // get refresh token from cookies
    // validate refresh token
    // generate new access token
    // send response}
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.ACCESS_TOKEN_SECRET
    )

    const user = await User.findById(incomingRefreshToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid Refresh Token")
    }

    if( incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")

    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken, newRefreshToken} = await generateAccessandRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed "
        )
    )
}


export { 
    registerUser,
    loginUser,
    logoutUser
}
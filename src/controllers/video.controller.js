import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const getAllVidoes = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination

    const {page = 1, limit = 10}  = req.query;

    const skip = (page -1 ) * limit;

    const query = {
        title: { $regex: req.query.title || "", $options: "i" },
    }

    const videos = await Video.find(query)
    .populate("owner", "username avatar")
    .sort({ createdAt: -1})
    .skip(skip)
    .limit(parseInt(limit));

    res.status(200)
    .json(
        new ApiResponse(200 , videos, "Videos fetched successfully")
    )
    
})


const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video

    const {title, description} = req.body
 
    
    if(!req.files?.video || !req.files?.thumbnail){
        throw new ApiError(400, "Video and thumbnail are required")
    }

    
    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

        console.log("Video Local Path:", videoLocalPath);
console.log("Thumb Local Path:", thumbnailLocalPath);

    const videoUpload = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    



    if(!videoUpload || !thumbnail){
        throw new ApiError(500, "Error uploading video or thumbnail")
    }


    const video = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        thumbnail: thumbnail.url,
        duration: req.files.video[0].duration || 0,
        owner: req.user._id
    })

    res.status(201)
    .json(
        new ApiResponse(201, video, "Video published successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const { videoId } = req.params

    const video = await Video.findById(videoId)
    .populate("owner", "username avatar")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.view += 1
    await video.save()

    res.status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully")
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is missing")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    const { title, description } = req.body

    if (title) {
        video.title = title
    }

    if (description) {
        video.description = description
    }

    if (req.thumbnail) {
        video.thumbnailUrl = await uploadOnCloudinary(req.files.thumbnail[0], "thumbnail")
    }

    await video.save()

    res.status(200)
    .json(
        new ApiResponse(200, video, "Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() != req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await video.remove()

    res.status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params


})



export {
    getAllVidoes,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo

}
import { asyncHandler } from "../utils/asyncHandler";
import { Video } from "../models/video.model";
import { uploadOnCloudinary } from "../utils/cloudinary";



const getAllVidoes = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination

    const {page = 1, limit = 10}  = req.query;

    const skip = (page -1 ) * limit;

    const query = {
        title: { $regex: req.query.title || "", $options: "i" },
    }

    const videos = Video.find(query)
    .populate("owner", "username avatar")
    .sort({ createdAt: -1})
    .skip(skip)
    .limit(parseInt(limit));

    res.satatus(200)
    .json(
        new ApiResponse(200 , videos, "Videos fetched successfully")
    )
    
})


const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video

    const {title, description} = req.bdoy

    if(!req.files || !req.files.video || req.files.thumbnail){
        throw new APiError(400, "Video and thumbnail are required")
    }

    const videoUrl = await uploadOnCloudinary(req.files.video[0], "video")
    const thumbnailUrl = await uploadOnCloudinary(req.files.thumbnail[0], "thumbnail")


    const video = Video.create({
        title,
        description,
        videoUrl,
        thumbnailUrl,
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

    const video = Video.findById(videoId)
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






export {
    getAllVidoes,



}
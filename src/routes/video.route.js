import {Router} from "express"
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { 
    deleteVideo, 
    getAllVidoes, 
    getVideoById, 
    publishAVideo, 
    updateVideo 
} from "../controllers/video.controller.js"


const router = Router()

router.route("/uploads").post(
    verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
)


router.route("/all-videos").get(getAllVidoes)
router.route("/:videoId").get(getVideoById)

//secured routes
router.route("/:videoId").put(verifyJWT, upload.single("thumbnail"), updateVideo)
router.route("/:videoId").delete(verifyJWT, deleteVideo)



export default router
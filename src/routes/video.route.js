import {Router} from "express"
import { upload } from "../middleware/multer.middleware"
import { verifyJWT } from "../middleware/auth.middleware"
import { deleteVideo, getAllVidoes, getVideoById, publishAVideo, updateVideo } from "../controllers/video.controller"



const router = Router()

router.route("/uploads", verifyJWT).post(
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

router.route("/").post(getAllVidoes)
router.route("/:videoId").post(getVideoById)

//secured routes
router.route("/:videoId").put(verifyJWT, upload.single("thumbnail"), updateVideo)
router.route("/:videoId").delete(verifyJWT, deleteVideo)



export default router
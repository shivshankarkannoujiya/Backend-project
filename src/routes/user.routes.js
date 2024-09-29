import { Router } from "express"
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/users.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()


router.route("/register").post( registerUser )
router.route("/login").post( loginUser )

// secured route
router.route("/logout").post( verifyJWT, logoutUser )
router.route("/refresh-token").post( refreshAccessToken )

export default router
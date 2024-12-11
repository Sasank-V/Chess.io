import { Router,RequestHandler } from "express";
import { loginHandler, logoutHandler, refreshHandler, sendOTPHandler, signupHandler, updatePassHandler, validateOTPHandler } from "../controllers/auth";

const router = Router();

router.post("/signup", signupHandler);
router.post("/login",loginHandler);
router.post("/logout",logoutHandler);
router.get("/refresh",refreshHandler);

router.post("/sendOTP",sendOTPHandler);
router.post("/validateOTP",validateOTPHandler)
router.post("/updatePass",updatePassHandler);

export default router;
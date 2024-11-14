import { Router,RequestHandler } from "express";
import { loginHandler, logoutHandler, refreshHandler, signupHandler } from "../controllers/auth";

const router = Router();

router.post("/signup", signupHandler);
router.post("/login",loginHandler);
router.post("/logout",logoutHandler);
router.post("/refresh",refreshHandler);

export default router;
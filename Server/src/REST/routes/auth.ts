import { Router,RequestHandler } from "express";
import { loginHandler, logoutHandler, refreshHandler } from "../controllers/auth";

const router = Router();

router.post("/login",loginHandler);
router.post("/logout",logoutHandler);
router.get("/refresh",refreshHandler);


export default router;
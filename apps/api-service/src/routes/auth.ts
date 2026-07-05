import { Router,RequestHandler } from "express";
import { loginHandler } from "../controllers/auth";

const router = Router();

router.post("/login",loginHandler);


export default router;
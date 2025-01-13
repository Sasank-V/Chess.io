import { Router } from "express";
import { getGameInfoHandler, getUserProfileHandler } from "../controllers/user";
const router = Router();

router.post("/profile", getUserProfileHandler);
router.get("/game/:id", getGameInfoHandler);
// router.post("/addFriend");

export default router;

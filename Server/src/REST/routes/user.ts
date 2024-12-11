import { Router} from "express";
import { getUserProfileHandler } from "../controllers/user";
const router = Router();

router.get("/profile",getUserProfileHandler);
router.get("/game/:id");
router.post("/addFriend");

export default router;
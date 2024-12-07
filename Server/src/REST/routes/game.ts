import { Router } from "express";
import { addMoveHandler, createGameHandler, gameOverHandler } from "../controllers/game";
const router = Router();

router.post("/create",createGameHandler);
router.post("/move",addMoveHandler);
router.post("/over",gameOverHandler);

export default router;
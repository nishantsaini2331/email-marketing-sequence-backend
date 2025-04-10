import { Router } from "express";
import { startProcess } from "../controllers/sequence.controller.js";

const router = Router();

router.post("/start-process", startProcess);

export default router;

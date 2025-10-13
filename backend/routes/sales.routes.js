import express from "express";
import { getSalesSummary, getSalesByDate } from "../controllers/sales.controllers.js";

const router = express.Router();

router.get("/summary", getSalesSummary);
router.get("/by-date", getSalesByDate);

export default router;

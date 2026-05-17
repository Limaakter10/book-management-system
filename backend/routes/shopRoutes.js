import express from "express";
import { getBooks } from "../controllers/shopController.js";

const router = express.Router();

router.get("/", getBooks);

export default router;
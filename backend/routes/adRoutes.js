const express = require("express");
const router = express.Router();
const Ad = require("../models/Ad");

// GET ALL ADS
router.get("/", async (req, res) => {
  const ads = await Ad.find().sort({ createdAt: -1 });
  res.json(ads);
});

module.exports = router;
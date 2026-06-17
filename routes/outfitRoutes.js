const express = require("express");
const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const {
  saveOutfit,
  getOutfits,
  generateOutfit
} = require(
  "../controllers/outfitController"
);



router.post(
  "/",
  authMiddleware,
  saveOutfit
);

router.get(
  "/",
  authMiddleware,
  getOutfits
);

router.get(
  "/generate",
  authMiddleware,
  generateOutfit
);

module.exports = router;
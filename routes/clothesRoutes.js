const express = require("express");
const router = express.Router();
const authMiddleware = require(
  "../middleware/authMiddleware"
);

const {
  getClothes,
  addClothing,
  updateClothing,
  deleteClothing
} = require(
  "../controllers/clothesController"
);



router.get(
  "/",
  authMiddleware,
  getClothes
);

router.post(
  "/",
  authMiddleware,
  addClothing
);

router.put(
  "/:id",
  authMiddleware,
  updateClothing
);

router.delete(
  "/:id",
  authMiddleware,
  deleteClothing
);

module.exports = router;
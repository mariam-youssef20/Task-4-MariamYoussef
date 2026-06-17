const pool = require("../config/db");
const saveOutfit = async (req, res) => {
  try {
    const {
      topId,
      bottomId,
      shoesId,
      jacketId,
      accessories,
    } = req.body;

    if (!topId || !bottomId || !shoesId) {
      return res.status(400).json({
        message: "Top, Bottom and Shoes are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO saved_outfits
      (
        user_id,
        top_id,
        bottom_id,
        shoes_id,
        jacket_id,
        accessories
      )
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        req.user.id,
        topId,
        bottomId,
        shoesId,
        jacketId,
        accessories || [],
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getOutfits = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM saved_outfits
      WHERE user_id = $1
      ORDER BY id DESC
      `,
      [req.user.id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const generateOutfit = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM clothing_items
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    const clothes = result.rows;

    const tops = clothes.filter(
      item => item.category.toLowerCase() === "top"
    );

    const bottoms = clothes.filter(
      item => item.category.toLowerCase() === "bottom"
    );

    const shoes = clothes.filter(
      item => item.category.toLowerCase() === "shoes"
    );

    if (
      tops.length === 0 ||
      bottoms.length === 0 ||
      shoes.length === 0
    ) {
      return res.status(400).json({
        message:
          "Need at least one Top, Bottom and Shoes",
      });
    }

    const top =
      tops[Math.floor(Math.random() * tops.length)];

    const bottom =
      bottoms[Math.floor(Math.random() * bottoms.length)];

    const shoe =
      shoes[Math.floor(Math.random() * shoes.length)];

    res.json({
      top,
      bottom,
      shoes: shoe,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
module.exports = {
  saveOutfit,
  getOutfits,
  generateOutfit
};
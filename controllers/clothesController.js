const pool = require("../config/db");

const getClothes = async(req, res) => {

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM clothing_items
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

const addClothing = async (req, res) => {
  try {
    const {
      name,
      category,
      color,
      season,
      image_url
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Name and category are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO clothing_items
      (
        user_id,
        name,
        category,
        color,
        season,
        image_url
      )
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        req.user.id,
        name,
        category,
        color,
        season,
        image_url
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

const updateClothing = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      category,
      color,
      season,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE clothing_items
      SET
      name = $1,
      category = $2,
      color = $3,
      season = $4
      WHERE id = $5
      AND user_id = $6
      RETURNING *
      `,
      [
        name,
        category,
        color,
        season,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
const deleteClothing = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM clothing_items
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    res.json({
      message: "Clothing item deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getClothes,
  addClothing,
  updateClothing,
  deleteClothing
};
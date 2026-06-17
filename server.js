require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require(
  "./routes/authRoutes"
);

const clothesRoutes = require(
  "./routes/clothesRoutes"
);

const outfitRoutes = require(
  "./routes/outfitRoutes"
);

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Digital Closet API Running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/clothes",
  clothesRoutes
);

app.use(
  "/api/outfits",
  outfitRoutes
);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal Server Error"
  });
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
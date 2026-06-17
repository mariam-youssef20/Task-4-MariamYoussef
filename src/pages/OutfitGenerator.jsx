import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function OutfitGenerator() {
  const navigate = useNavigate();
  const [outfit, setOutfit] = useState(null);
  const [empty, setEmpty] = useState(false);

  const categoryEmoji = {
    Top: "👕",
    Bottom: "👖",
    Shoes: "👟",
    Jacket: "🧥",
    Accessory: "💍",
  };

  const generateOutfit = async () => {
    setEmpty(false);
    setOutfit(null);
    try {
      const res = await api.get("/outfits/generate");
      setOutfit(res.data);
    } catch (error) {
      setEmpty(true);
    }
  };

  const saveOutfit = async () => {
    try {
      await api.post("/outfits", {
        topId: outfit.top.id,
        bottomId: outfit.bottom.id,
        shoesId: outfit.shoes.id,
        jacketId: null,
        accessories: [],
      });
      navigate("/saved-outfits");
    } catch (error) {
      alert("Save failed.");
    }
  };

  const outfitPieces = outfit
    ? [
        { label: "Top",    item: outfit.top },
        { label: "Bottom", item: outfit.bottom },
        { label: "Shoes",  item: outfit.shoes },
        outfit.jacket && { label: "Jacket", item: outfit.jacket },
      ].filter(Boolean)
    : [];

  return (
    <>
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Outfit Generator</h2>
          <p className="page-subtitle">Let us put together your next look.</p>
        </div>

        <div className="generator-actions">
          <button className="btn btn-primary" onClick={generateOutfit}>
            🎲 Generate Random Outfit
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate("/saved-outfits")}
          >
            📌 Saved Outfits
          </button>
          {outfit && (
            <button className="btn btn-secondary" onClick={saveOutfit}>
              📌 Save Outfit
            </button>
          )}
        </div>

        {outfit && (
          <div className="outfit-display">
            <div className="outfit-cards">
              {outfitPieces.map(({ label, item }) => (
                <div className="outfit-item-card" key={label}>
                  <div className="outfit-item-label">{label}</div>
                  <div className="card-img-wrap">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className="card-placeholder">
                        {categoryEmoji[item.category] || "👗"}
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-name">{item.name}</div>
                    <div className="card-meta">
                      <span className="card-tag accent">{item.color}</span>
                      <span className="card-tag">{item.season}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {empty && (
          <div className="empty-state">
            <span className="empty-icon">👗</span>
            <p>
              You need at least one Top, one Bottom, and one pair of Shoes to
              generate an outfit.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/add-clothing")}
            >
              Add clothes now
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default OutfitGenerator;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import OutfitCard from "../components/OutfitCard";
import api from "../services/api";

function SavedOutfits() {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState([]);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const res = await api.get("/outfits");
      setOutfits(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Saved Outfits</h2>
          <p className="page-subtitle">Your curated looks, ready to wear.</p>
        </div>

        {outfits.length > 0 ? (
          <div className="outfits-grid">
            {outfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📌</span>
            <p>No saved outfits yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/outfits")}
            >
              Generate one
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default SavedOutfits;

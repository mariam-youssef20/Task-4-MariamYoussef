import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [totalClothes, setTotalClothes] = useState(0);
  const [savedOutfits, setSavedOutfits] = useState(0);
  const [tops, setTops] = useState(0);
  const [bottoms, setBottoms] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const clothes = await api.get("/clothes");
      const outfits = await api.get("/outfits");

      const clothesList = clothes.data;
      setTotalClothes(clothesList.length);
      setSavedOutfits(outfits.data.length);
      setTops(clothesList.filter((c) => c.category === "Top").length);
      setBottoms(clothesList.filter((c) => c.category === "Bottom").length);
    } catch (error) {
      console.error(error);
    }
  };

  const quickActions = [
    { icon: "＋", label: "Add Clothing",   path: "/add-clothing" },
    { icon: "🗂",  label: "Browse Closet", path: "/closet" },
    { icon: "🎲",  label: "Generate Outfit", path: "/outfits" },
     { icon: "🪡",  label: "Build Outfit",     path: "/build-outfit" },
    { icon: "🤖",  label: "AI Try-On",        path: "/ai-tryon" },
    { icon: "📌",  label: "Saved Outfits", path: "/saved-outfits" },
  ];

  return (
    <>
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Welcome back ✦</h2>
          <p className="page-subtitle">Here's what's in your wardrobe today.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👕</div>
            <div className="stat-info">
              <span className="stat-number">{totalClothes}</span>
              <span className="stat-label">Total Clothes</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✨</div>
            <div className="stat-info">
              <span className="stat-number">{savedOutfits}</span>
              <span className="stat-label">Saved Outfits</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🧥</div>
            <div className="stat-info">
              <span className="stat-number">{tops}</span>
              <span className="stat-label">Tops</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👖</div>
            <div className="stat-info">
              <span className="stat-number">{bottoms}</span>
              <span className="stat-label">Bottoms</span>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            {quickActions.map((action) => (
              <button
                key={action.path}
                className="action-card"
                onClick={() => navigate(action.path)}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export default Dashboard;

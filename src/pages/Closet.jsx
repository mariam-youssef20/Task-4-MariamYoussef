import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ClothingCard from "../components/ClothingCard";
import api from "../services/api";

const FILTERS = ["All", "Top", "Bottom", "Shoes", "Jacket", "Accessory"];

function Closet() {
  const navigate = useNavigate();
  const [clothes, setClothes] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchClothes = async () => {
    try {
      const res = await api.get("/clothes");
      setClothes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  const deleteClothing = async (id) => {
    try {
      await api.delete(`/clothes/${id}`);
      fetchClothes();
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = clothes.filter((item) => {
    const matchesCategory =
      activeFilter === "All" || item.category === activeFilter;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">My Closet</h2>
          <p className="page-subtitle">All your clothing items in one place.</p>
        </div>

        <div className="closet-controls">
          <div className="search-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-icon">⌕</span>
          </div>

          <div className="filter-chips">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`chip${activeFilter === f ? " active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === "All" ? "All" : f + (f === "Top" ? "s" : f === "Bottom" ? "s" : f === "Shoes" ? "" : f === "Jacket" ? "s" : "s")}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="clothes-grid">
            {filtered.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onDelete={deleteClothing}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🪞</span>
            <p>
              {clothes.length === 0
                ? "Your closet is empty."
                : "No items match your search."}
            </p>
            {clothes.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/add-clothing")}
              >
                Add your first item
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default Closet;

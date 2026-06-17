import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const CATEGORY_EMOJI = {
  Top: "👕",
  Bottom: "👖",
  Shoes: "👟",
  Jacket: "🧥",
  Accessory: "💍",
};

// ─── Selectable Card ───────────────────────────────────────────────────────────
function SelectableCard({ item, selected, onToggle }) {
  return (
    <div
      className={`selectable-card${selected ? " selected" : ""}`}
      onClick={() => onToggle(item)}
    >
      <div className="selectable-img-wrap">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} loading="lazy" />
        ) : (
          <div className="selectable-placeholder">
            {CATEGORY_EMOJI[item.category] || "👗"}
          </div>
        )}
      </div>
      <div className="selectable-body">
        <div className="selectable-name" title={item.name}>
          {item.name}
        </div>
        <div className="selectable-meta">
          {item.color} · {item.season}
        </div>
      </div>
    </div>
  );
}

// ─── Section of selectable items ───────────────────────────────────────────────
function BuildSection({ type, title, hint, badge, items, selections, onToggle }) {
  return (
    <div className="build-outfit-section">
      <div className="build-section-header">
        <span className="build-section-badge">{badge}</span>
        <span className="build-section-title">{title}</span>
        <span className="build-section-hint">{hint}</span>
      </div>
      <div className="build-items-grid">
        {items.map((item) => {
          let selected = false;
          if (type === "accessories") {
            selected = selections.accessories.some((a) => a.id === item.id);
          } else {
            selected = selections[type]?.id === item.id;
          }
          return (
            <SelectableCard
              key={item.id}
              item={item}
              selected={selected}
              onToggle={() => onToggle(type, item)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Outfit preview item card ───────────────────────────────────────────────────
function OutfitItemCard({ label, item }) {
  return (
    <div className="outfit-item-card">
      <div className="outfit-item-label">{label}</div>
      <div className="card-img-wrap">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} loading="lazy" />
        ) : (
          <div className="card-placeholder">
            {CATEGORY_EMOJI[item.category] || "👗"}
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="card-name" title={item.name}>
          {item.name}
        </div>
        <div className="card-meta">
          <span className="card-tag">{item.category}</span>
          <span className="card-tag accent">{item.color}</span>
          <span className="card-tag">{item.season}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main BuildOutfit page ──────────────────────────────────────────────────────
function BuildOutfit() {
  const navigate = useNavigate();

  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  const [selections, setSelections] = useState({
    top: null,
    bottom: null,
    shoes: null,
    jacket: null,
    accessories: [],
  });

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/clothes");
      setClothes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group clothes by category
  const byCategory = (cat) => clothes.filter((c) => c.category === cat);
  const tops = byCategory("Top");
  const bottoms = byCategory("Bottom");
  const shoes = byCategory("Shoes");
  const jackets = byCategory("Jacket");
  const accessories = byCategory("Accessory");

  const hasMinimum = tops.length > 0 && bottoms.length > 0 && shoes.length > 0;

  // Toggle selection logic
  const handleToggle = (type, item) => {
    setSelections((prev) => {
      if (type === "accessories") {
        const exists = prev.accessories.some((a) => a.id === item.id);
        return {
          ...prev,
          accessories: exists
            ? prev.accessories.filter((a) => a.id !== item.id)
            : [...prev.accessories, item],
        };
      }
      if (type === "jacket") {
        return {
          ...prev,
          jacket: prev.jacket?.id === item.id ? null : item,
        };
      }
      // Required single-select (top, bottom, shoes)
      return {
        ...prev,
        [type]: prev[type]?.id === item.id ? null : item,
      };
    });
    setError("");
  };

  const handleCreateOutfit = () => {
    if (!selections.top || !selections.bottom || !selections.shoes) {
      setError("Please select a Top, Bottom, and Shoes to continue.");
      return;
    }
    setError("");
    setShowPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBuildAgain = () => {
    setShowPreview(false);
    setSelections({ top: null, bottom: null, shoes: null, jacket: null, accessories: [] });
    setError("");
  };

  const handleSaveOutfit = async () => {
    try {
      await api.post("/outfits", {
        topId: selections.top.id,
        bottomId: selections.bottom.id,
        shoesId: selections.shoes.id,
        jacketId: selections.jacket?.id || null,
        accessories: selections.accessories.map((a) => a.id),
      });
      navigate("/saved-outfits");
    } catch (err) {
      setError("Failed to save outfit. Please try again.");
    }
  };

  // Pieces for preview
  const previewPieces = [
    selections.top    && { label: "👕 Top",    item: selections.top },
    selections.bottom && { label: "👖 Bottom", item: selections.bottom },
    selections.shoes  && { label: "👟 Shoes",  item: selections.shoes },
    selections.jacket && { label: "🧥 Jacket", item: selections.jacket },
    ...selections.accessories.map((a) => ({ label: "💍 Accessory", item: a })),
  ].filter(Boolean);

  // ── Loading ──
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Build Your Own Outfit</h2>
            <p className="page-subtitle">Handpick your perfect look from your wardrobe.</p>
          </div>
          <div className="empty-state">
            <span className="empty-icon">🪡</span>
            <p>Loading your wardrobe…</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Build Your Own Outfit</h2>
          <p className="page-subtitle">Handpick your perfect look from your wardrobe.</p>
        </div>

        {/* ── Empty state: not enough clothes ── */}
        {!hasMinimum && (
          <div className="empty-state">
            <span className="empty-icon">🪡</span>
            <p>
              Add at least one Top, one Bottom, and one pair of Shoes to build
              an outfit.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/add-clothing")}
            >
              Add clothes now
            </button>
          </div>
        )}

        {/* ── Builder (selection step) ── */}
        {hasMinimum && !showPreview && (
          <>
            <BuildSection
              type="top"
              title="Tops"
              badge="1"
              hint="Required — choose 1"
              items={tops}
              selections={selections}
              onToggle={handleToggle}
            />

            <BuildSection
              type="bottom"
              title="Bottoms"
              badge="1"
              hint="Required — choose 1"
              items={bottoms}
              selections={selections}
              onToggle={handleToggle}
            />

            <BuildSection
              type="shoes"
              title="Shoes"
              badge="1"
              hint="Required — choose 1"
              items={shoes}
              selections={selections}
              onToggle={handleToggle}
            />

            {jackets.length > 0 && (
              <BuildSection
                type="jacket"
                title="Jackets"
                badge="Opt"
                hint="Optional — max 1"
                items={jackets}
                selections={selections}
                onToggle={handleToggle}
              />
            )}

            {accessories.length > 0 && (
              <BuildSection
                type="accessories"
                title="Accessories"
                badge="Multi"
                hint="Optional — select multiple"
                items={accessories}
                selections={selections}
                onToggle={handleToggle}
              />
            )}

            {error && (
              <div className="form-error" style={{ textAlign: "left", marginBottom: 12 }}>
                {error}
              </div>
            )}

            <div className="build-outfit-create">
              <button
                className="btn btn-primary"
                style={{ padding: "14px 48px", fontSize: "1rem" }}
                onClick={handleCreateOutfit}
              >
                ✦ Create Outfit
              </button>
            </div>
          </>
        )}

        {/* ── Preview step ── */}
        {hasMinimum && showPreview && (
          <div id="build-outfit-preview">
            <div className="outfit-preview-header">
              <h3 className="section-title">Your Outfit</h3>
            </div>

            <div className="build-outfit-result">
              {previewPieces.map(({ label, item }) => (
                <OutfitItemCard key={`${label}-${item.id}`} label={label} item={item} />
              ))}
            </div>

            {error && (
              <div className="form-error" style={{ marginTop: 16 }}>
                {error}
              </div>
            )}

            <div className="form-actions" style={{ marginTop: 28 }}>
              <button className="btn btn-primary" onClick={handleSaveOutfit}>
                📌 Save Outfit
              </button>
              <button className="btn btn-ghost" onClick={handleBuildAgain}>
                ↩ Build Again
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default BuildOutfit;
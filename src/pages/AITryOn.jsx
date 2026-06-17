import { useEffect, useRef, useState } from "react";
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

function AITryOn() {
  const navigate = useNavigate();

  // ── Wardrobe data ──
  const [clothes, setClothes] = useState([]);

  // ── Photo upload ──
  const photoInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // ── Outfit selectors ──
  const [selectedTop, setSelectedTop] = useState("");
  const [selectedBottom, setSelectedBottom] = useState("");
  const [selectedShoes, setSelectedShoes] = useState("");
  const [selectedJacket, setSelectedJacket] = useState("");
  const [selectedAccessories, setSelectedAccessories] = useState([]);

  // ── Result ──
  const [showResult, setShowResult] = useState(false);
  const [resultItems, setResultItems] = useState([]);

  const resultRef = useRef(null);

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    try {
      const res = await api.get("/clothes");
      setClothes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Group by category
  const byCategory = (cat) => clothes.filter((c) => c.category === cat);
  const tops        = byCategory("Top");
  const bottoms     = byCategory("Bottom");
  const shoes       = byCategory("Shoes");
  const jackets     = byCategory("Jacket");
  const accessories = byCategory("Accessory");

  // ── Photo handlers ──
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoClear = () => {
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  // ── Accessory chip toggle ──
  const toggleAccessory = (id) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // ── Generate handler (mirrors handleAiGenerate in script.js) ──
  const handleGenerate = () => {
    const findById = (id) => clothes.find((c) => c.id === parseInt(id) || c.id === id) || null;

    const chips = [];

    if (selectedTop) {
      const item = findById(selectedTop);
      if (item) chips.push({ emoji: CATEGORY_EMOJI.Top, label: "Top", name: item.name });
    }
    if (selectedBottom) {
      const item = findById(selectedBottom);
      if (item) chips.push({ emoji: CATEGORY_EMOJI.Bottom, label: "Bottom", name: item.name });
    }
    if (selectedShoes) {
      const item = findById(selectedShoes);
      if (item) chips.push({ emoji: CATEGORY_EMOJI.Shoes, label: "Shoes", name: item.name });
    }
    if (selectedJacket) {
      const item = findById(selectedJacket);
      if (item) chips.push({ emoji: CATEGORY_EMOJI.Jacket, label: "Jacket", name: item.name });
    }
    selectedAccessories.forEach((id) => {
      const item = findById(id);
      if (item) chips.push({ emoji: CATEGORY_EMOJI.Accessory, label: "Accessory", name: item.name });
    });

    setResultItems(chips);
    setShowResult(true);

    // Scroll to result after render
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <>
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">AI Virtual Try-On</h2>
          <p className="page-subtitle">See yourself in your outfits — powered by AI.</p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="ai-tryon-layout">

          {/* Step 1 — Upload Photo */}
          <div className="ai-step-card">
            <div className="ai-step-number">01</div>
            <h3 className="ai-step-title">Upload Your Photo</h3>
            <p className="ai-step-desc">
              Choose a clear, front-facing photo of yourself.
            </p>

            {!photoPreview && (
              <div className="file-upload-wrap ai-photo-upload">
                <input
                  ref={photoInputRef}
                  type="file"
                  id="ai-photo-input"
                  accept="image/*"
                  className="file-input"
                  onChange={handlePhotoChange}
                />
                <label
                  htmlFor="ai-photo-input"
                  className="file-upload-label ai-upload-label"
                >
                  <span className="file-upload-icon" style={{ fontSize: "2.4rem" }}>
                    🤳
                  </span>
                  <span className="file-upload-text">Choose Your Photo</span>
                  <span
                    style={{
                      fontSize: ".78rem",
                      color: "var(--clr-text-muted)",
                      marginTop: 4,
                    }}
                  >
                    JPG, PNG supported
                  </span>
                </label>
              </div>
            )}

            {photoPreview && (
              <div className="ai-photo-preview-wrap">
                <img
                  className="ai-photo-preview"
                  src={photoPreview}
                  alt="Your photo"
                />
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handlePhotoClear}
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          {/* Step 2 — Select Outfit */}
          <div className="ai-step-card">
            <div className="ai-step-number">02</div>
            <h3 className="ai-step-title">Select Outfit</h3>
            <p className="ai-step-desc">
              Choose the items you'd like to try on.
            </p>

            <div className="ai-outfit-selectors">

              {/* Top */}
              <div className="form-group">
                <label htmlFor="ai-top-select">Top</label>
                <select
                  id="ai-top-select"
                  value={selectedTop}
                  onChange={(e) => setSelectedTop(e.target.value)}
                >
                  <option value="">— Select a top —</option>
                  {tops.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bottom */}
              <div className="form-group">
                <label htmlFor="ai-bottom-select">Bottom</label>
                <select
                  id="ai-bottom-select"
                  value={selectedBottom}
                  onChange={(e) => setSelectedBottom(e.target.value)}
                >
                  <option value="">— Select a bottom —</option>
                  {bottoms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shoes */}
              <div className="form-group">
                <label htmlFor="ai-shoes-select">Shoes</label>
                <select
                  id="ai-shoes-select"
                  value={selectedShoes}
                  onChange={(e) => setSelectedShoes(e.target.value)}
                >
                  <option value="">— Select shoes —</option>
                  {shoes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jacket (optional) */}
              <div className="form-group">
                <label htmlFor="ai-jacket-select">
                  Jacket{" "}
                  <span style={{ fontWeight: 400, fontStyle: "italic" }}>
                    (optional)
                  </span>
                </label>
                <select
                  id="ai-jacket-select"
                  value={selectedJacket}
                  onChange={(e) => setSelectedJacket(e.target.value)}
                >
                  <option value="">— No jacket —</option>
                  {jackets.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Accessories (optional chips) */}
              <div className="form-group">
                <label>
                  Accessories{" "}
                  <span style={{ fontWeight: 400, fontStyle: "italic" }}>
                    (optional)
                  </span>
                </label>
                <div className="ai-accessories-list">
                  {accessories.length === 0 ? (
                    <p className="ai-no-items">
                      No accessories in your closet.
                    </p>
                  ) : (
                    accessories.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`ai-accessory-chip${
                          selectedAccessories.includes(item.id) ? " selected" : ""
                        }`}
                        onClick={() => toggleAccessory(item.id)}
                      >
                        {item.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Generate Button ── */}
        <div className="ai-generate-wrap">
          <button
            className="btn btn-primary ai-generate-btn"
            onClick={handleGenerate}
          >
            <span>✨</span> Generate AI Try-On
          </button>
        </div>

        {/* ── Result Area ── */}
        {showResult && (
          <div className="ai-result" ref={resultRef}>
            <div className="ai-result-header">
              <div className="ai-result-badge">✦ Generated Preview</div>
            </div>

            <div className="ai-result-mockup">
              <div className="ai-mockup-placeholder">
                <div className="ai-mockup-inner">
                  <span className="ai-mockup-icon">🤖</span>
                  <p className="ai-mockup-title">AI Try-On Coming Soon</p>
                  <p className="ai-mockup-msg">
                    This feature will be powered by AI in Project 5.
                  </p>
                </div>
              </div>
            </div>

            <div className="ai-result-items">
              {resultItems.length === 0 ? (
                <div className="ai-result-item-chip">
                  <span>👗</span>
                  <span>No items selected</span>
                </div>
              ) : (
                resultItems.map(({ emoji, label, name }, i) => (
                  <div key={i} className="ai-result-item-chip">
                    <span>{emoji}</span>
                    <span>{label}:</span>
                    <strong>{name}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default AITryOn;
function OutfitCard({ outfit }) {
  const categoryEmoji = {
    Top: "👕",
    Bottom: "👖",
    Shoes: "👟",
    Jacket: "🧥",
    Accessory: "💍",
  };

  const items = [
    outfit.top    && { label: "Top",    item: outfit.top },
    outfit.bottom && { label: "Bottom", item: outfit.bottom },
    outfit.shoes  && { label: "Shoes",  item: outfit.shoes },
    outfit.jacket && { label: "Jacket", item: outfit.jacket },
  ].filter(Boolean);

  // Fallback for flat id-based outfits
  const flatItems = [];
  if (!items.length) {
    if (outfit.top_id)    flatItems.push({ label: "Top",    id: outfit.top_id });
    if (outfit.bottom_id) flatItems.push({ label: "Bottom", id: outfit.bottom_id });
    if (outfit.shoes_id)  flatItems.push({ label: "Shoes",  id: outfit.shoes_id });
    if (outfit.jacket_id) flatItems.push({ label: "Jacket", id: outfit.jacket_id });
  }

  return (
    <div className="saved-outfit-card">
      <div className="saved-outfit-header">
        <span className="saved-outfit-title">✦ Saved Outfit</span>
        <span style={{ fontSize: ".8rem", opacity: 0.7 }}>
          #{outfit.id}
        </span>
      </div>

      <div className="outfit-items-list">
        {items.length > 0
          ? items.map(({ label, item }) => (
              <div className="outfit-mini-item" key={label}>
                <div className="outfit-mini-placeholder">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : (
                    categoryEmoji[item.category] || "👗"
                  )}
                </div>
                <div className="outfit-mini-info">
                  <div className="outfit-mini-name">{item.name}</div>
                  <div className="outfit-mini-cat">{label} · {item.color}</div>
                </div>
              </div>
            ))
          : flatItems.map(({ label, id }) => (
              <div className="outfit-mini-item" key={label}>
                <div className="outfit-mini-placeholder">
                  {categoryEmoji[label] || "👗"}
                </div>
                <div className="outfit-mini-info">
                  <div className="outfit-mini-name">Item #{id}</div>
                  <div className="outfit-mini-cat">{label}</div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export default OutfitCard;

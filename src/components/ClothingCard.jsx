function ClothingCard({ item, onDelete }) {
  const categoryEmoji = {
    Top: "👕",
    Bottom: "👖",
    Shoes: "👟",
    Jacket: "🧥",
    Accessory: "💍",
  };

  const placeholder = categoryEmoji[item.category] || "👗";

  return (
    <div className="clothing-card">
      <div className="card-img-wrap">
        {item.image_url ? (
         <img
src={
item.image_url ||
"https://placehold.co/300x300?text=No+Image"
}
alt={item.name}
className="clothing-image"
/>
        ) : (
          <div className="card-placeholder">{placeholder}</div>
        )}
      </div>

      <div className="card-body">
        <div className="card-name" title={item.name}>
          {item.name}
        </div>
        <div className="card-meta">
          <span className="card-tag">{item.category}</span>
          <span className="card-tag accent">{item.season}</span>
          <span className="card-tag">
            <span
              className="card-color-dot"
              style={{ background: item.color?.toLowerCase() }}
            />
            {item.color}
          </span>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-danger" onClick={() => onDelete(item.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default ClothingCard;

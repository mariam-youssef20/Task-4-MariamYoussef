import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { uploadImage } from "../services/cloudinary";
function AddClothing() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [nameError, setNameError] = useState("");
  const [colorError, setColorError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [seasonError, setSeasonError] = useState("");

 const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (file) {
    setImageFile(file);

    const reader = new FileReader();

    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
    };

    reader.readAsDataURL(file);
  }
};

  const validate = () => {
    let valid = true;
    setNameError("");
    setColorError("");
    setCategoryError("");
    setSeasonError("");

    if (!name.trim()) { setNameError("Name is required."); valid = false; }
    if (!color.trim()) { setColorError("Color is required."); valid = false; }
    if (!category) { setCategoryError("Please select a category."); valid = false; }
    if (!season) { setSeasonError("Please select a season."); valid = false; }
    return valid;
  };

  const submitHandler = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {

    let imageUrl = "";

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    await api.post("/clothes", {
      name,
      category,
      color,
      season,
      image_url: imageUrl,
    });

    setName("");
    setCategory("");
    setColor("");
    setSeason("");
    setImageFile(null);
    setImagePreview(null);

    navigate("/closet");

  } catch (error) {
    console.log(error);
    alert("Failed to add clothing item");
  }
};

  return (
    <>
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Add Clothing Item</h2>
          <p className="page-subtitle">
            Fill in the details below to add a new piece.
          </p>
        </div>

        <div className="form-card">
          <form onSubmit={submitHandler} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item-name">Clothing Name</label>
                <input
                  type="text"
                  id="item-name"
                  placeholder="e.g. White Linen Shirt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="field-error">{nameError}</span>
              </div>

              <div className="form-group">
                <label htmlFor="item-color">Color</label>
                <input
                  type="text"
                  id="item-color"
                  placeholder="e.g. Ivory White"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <span className="field-error">{colorError}</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item-category">Category</label>
                <select
                  id="item-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="Top">Top</option>
                  <option value="Bottom">Bottom</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Jacket">Jacket</option>
                  <option value="Accessory">Accessory</option>
                </select>
                <span className="field-error">{categoryError}</span>
              </div>

              <div className="form-group">
                <label htmlFor="item-season">Season</label>
                <select
                  id="item-season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                >
                  <option value="">Select season</option>
                  <option value="Summer">Summer</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Autumn">Autumn</option>
                  <option value="All">All Seasons</option>
                </select>
                <span className="field-error">{seasonError}</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="item-image-file">Upload Image</label>
              <div className="file-upload-wrap">
                <input
  type="file"
  id="item-image-file"
  accept="image/*"
  className="file-input"
  onChange={handleImageChange}
/>
                <label htmlFor="item-image-file" className="file-upload-label">
                  <span className="file-upload-icon">📷</span>
                  <span className="file-upload-text">
                    {imageFile ? imageFile.name : "Choose an image…"}
                  </span>
                </label>
              </div>
            </div>

            {imagePreview && (
              <div className="image-preview-wrap">
                <img
                  className="image-preview"
                  src={imagePreview}
                  alt="Preview"
                />
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Item
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/closet")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default AddClothing;

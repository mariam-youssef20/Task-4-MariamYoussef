import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Closet from "./pages/Closet";
import AddClothing from "./pages/AddClothing";
import OutfitGenerator from "./pages/OutfitGenerator";
import SavedOutfits from "./pages/SavedOutfits";
import ProtectedRoute from "./components/ProtectedRoute";
import BuildOutfit from "./pages/BuildOutfit";
import AITryOn from "./pages/AITryOn";

function App() {
  return (
    <BrowserRouter>
      <Routes>
<Route
  path="/"
  element={<Navigate to="/login" />}
/>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/closet"
          element={
            <ProtectedRoute>
              <Closet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-clothing"
          element={
            <ProtectedRoute>
              <AddClothing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/outfits"
          element={
            <ProtectedRoute>
              <OutfitGenerator />
            </ProtectedRoute>
          }
        />
<Route
path="/build-outfit"
element={<BuildOutfit/>}
/>

<Route
path="/ai-tryon"
element={<AITryOn/>}
/>
        <Route
          path="/saved-outfits"
          element={
            <ProtectedRoute>
              <SavedOutfits />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
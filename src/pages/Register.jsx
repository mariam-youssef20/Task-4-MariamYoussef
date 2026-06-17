import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setFormError("");

    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      await api.post("/auth/register", { username, email, password });
      navigate("/login");
    } catch (error) {
      setFormError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">✦</span>
          <h1 className="brand-name">Digital Closet</h1>
          <p className="brand-tagline">Join the wardrobe revolution.</p>
        </div>

        <form className="auth-form" onSubmit={submitHandler} noValidate>
          <div className="form-group">
            <label htmlFor="signup-username">Username</label>
            <input
              type="text"
              id="signup-username"
              placeholder="fashionista"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              type="email"
              id="signup-email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              type="password"
              id="signup-password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              type="password"
              id="signup-confirm"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {formError && (
            <div className="form-error">{formError}</div>
          )}

          <button type="submit" className="btn btn-primary btn-full">
            Create Account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

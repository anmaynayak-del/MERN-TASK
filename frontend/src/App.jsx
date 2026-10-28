import React, { useState, useEffect } from "react";
import NotFound from "./NotFound";
import "./App.css";

function App() {
  const [currentRoute, setCurrentRoute] = useState(
    window.location.pathname === "/login" || window.location.hash === "#login"
      ? "/login"
      : "/"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === "/login" || window.location.hash === "#login") {
        setCurrentRoute("/login");
      } else {
        setCurrentRoute("/");
      }
    };

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
    };
  }, []);

  const navigateTo = (path) => {
    if (path === "/login") {
      window.history.pushState({}, "", "/login");
      setCurrentRoute("/login");
    } else {
      window.history.pushState({}, "", "/");
      setCurrentRoute("/");
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setIsSuccess(false);
      setMessage("Please fill in both Email and Password.");
      return;
    }

    if (!isEmailValid) {
      setIsSuccess(false);
      setMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setIsSuccess(false);
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/signup`
        : "http://localhost:5000/api/signup";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      setIsSuccess(true);
      setMessage(data.message || "Sign Up successful!");
      setEmail("");
      setPassword("");
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.message || "An error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  if (currentRoute === "/login") {
    return <NotFound onNavigateHome={() => navigateTo("/")} requestedPath="/login" />;
  }

  return (
    <div className="task2-wrapper">
      <div className="task2-card">
        <h1 className="task2-title">Sign Up</h1>
        <p className="task2-subtitle">
          Already a member?{" "}
          <button 
            type="button" 
            className="task2-login-link"
            onClick={() => navigateTo("/login")}
          >
            Log In
          </button>
        </p>

        <form onSubmit={handleSubmit} className="task2-form" noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-container">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </span>
              <input
                type="email"
                id="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Message Banner */}
        {message && (
          <div className={`message-banner ${isSuccess ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

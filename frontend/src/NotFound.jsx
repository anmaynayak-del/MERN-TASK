import React from "react";
import "./NotFound.css";

export default function NotFound({ onNavigateHome, requestedPath = "/login" }) {
  return (
    <div className="task2-wrapper">
      <div className="task2-card notfound-card-clean">
        <span className="notfound-pill">404 ERROR</span>
        <h1 className="notfound-code-clean">404</h1>
        <h2 className="notfound-title-clean">Page Not Found</h2>
        
        <p className="notfound-desc-clean">
          The route <code className="path-chip">{requestedPath}</code> does not exist. 
          Please use the sign up form.
        </p>

        <button 
          type="button" 
          className="submit-button" 
          onClick={onNavigateHome}
        >
          ← Back to Sign Up
        </button>
      </div>
    </div>
  );
}

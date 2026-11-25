import "./driving-simulator.js";
import "./car-showcase.js";
import "./car-showcase.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./react.css";

const rootElement = document.getElementById("react-learning-root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

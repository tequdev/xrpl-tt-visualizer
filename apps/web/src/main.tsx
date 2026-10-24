import "@tequdev/xahau-design-system";
import React from "react";
import ReactDOM from "react-dom/client";
import "./app.css";
import HexConversion from "./HexConversion";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <HexConversion />
  </React.StrictMode>,
);

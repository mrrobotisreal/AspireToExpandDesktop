import * as React from "react";
import { createRoot } from "react-dom/client";
import "./assets/styles/style.css";

import App from "./views/app";
import ThemeProvider from "./context/themeContext";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

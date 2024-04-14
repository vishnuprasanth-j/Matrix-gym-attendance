import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Approutes.jsx";
import { AuthProvider } from "./lib/AuthContext.jsx";
import {createTheme, ThemeProvider} from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <ThemeProvider theme={theme}>
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
    </ThemeProvider>
  </React.StrictMode>
);

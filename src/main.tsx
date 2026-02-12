  import React from 'react';
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router-dom";
  import App from "./App.tsx";
  import "./index.css";
  import "leaflet/dist/leaflet.css";
  import { ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import "./i18n"; 

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <App />
      <ToastContainer 
        position="bottom-left" 
        toastClassName="custom-toast"
      />
    </BrowserRouter>
  
);
  

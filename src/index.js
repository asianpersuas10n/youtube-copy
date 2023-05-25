import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./Font/Roboto-Light.ttf";
import "./index.css";
import App from "./Routes/App";
import Channel from "./Routes/Channel";
import Watch from "./Routes/Watch";
import StoreProvider from "./Components/Data";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="channel/*" element={<Channel />} />
          <Route path="watch/*" element={<Watch />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>
);

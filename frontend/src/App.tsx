import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import Home from "./pages/Home";
import CoinDetailPage from "./pages/Coin";
import { ThemeProvider } from "@/components/theme-provider";

const App: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js?56";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Navbar />
        <div className=" ">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coin/:tokenAddress" element={<CoinDetailPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
